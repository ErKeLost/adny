/**
 * Refreshes `src/data/github-repos.ts` from the GitHub REST API.
 *
 * Project Timeline stats (stars / forks / description / language) are rendered
 * from static data. They used to be hand-typed into `src/data/portfolio.ts`,
 * so they drifted silently: repos got renamed and star counts moved on without
 * anyone noticing.
 *
 * This script is now the source of those numbers. It runs before `build`, and
 * can be run by hand:
 *
 *   bun run sync:github
 *
 * Auth is optional but recommended. It reads `GITHUB_TOKEN` / `GH_TOKEN` and
 * falls back to `gh auth token`. Without a token GitHub caps you at 60
 * requests per hour per IP, which is enough for this repo list but flaky on
 * shared CI runners.
 *
 * Failures are never fatal: the previously generated entries are kept so a
 * deploy without network still ships the last known good numbers.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { githubRepos as previousRepos } from "../src/data/github-repos";
import { currentProducts, pinnedProducts } from "../src/data/portfolio";

const OUTPUT_URL = new URL("../src/data/github-repos.ts", import.meta.url);

const REQUEST_TIMEOUT_MS = 15_000;

type RepoResponse = {
	full_name?: string;
	html_url?: string;
	description?: string | null;
	language?: string | null;
	stargazers_count?: number;
	forks_count?: number;
	owner?: { avatar_url?: string };
	message?: string;
};

type LiveRepo = {
	fullName: string;
	url: string;
	description: string;
	language: string;
	stars: number;
	forks: number;
	ownerAvatar: string;
};

function resolveToken(): string | undefined {
	const fromEnv = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
	if (fromEnv) return fromEnv;

	try {
		const token = execFileSync("gh", ["auth", "token"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		return token || undefined;
	} catch {
		return undefined;
	}
}

async function fetchRepo(path: string, token?: string): Promise<LiveRepo> {
	const response = await fetch(`https://api.github.com/repos/${path}`, {
		headers: {
			Accept: "application/vnd.github+json",
			"User-Agent": "adny-me-portfolio-sync",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!response.ok) {
		const body = (await response
			.json()
			.catch(() => null)) as RepoResponse | null;
		throw new Error(body?.message ?? `HTTP ${response.status}`);
	}

	const repo = (await response.json()) as RepoResponse;

	return {
		fullName: repo.full_name ?? path,
		url: repo.html_url ?? `https://github.com/${path}`,
		description: repo.description?.replace(/\s+/g, " ").trim() ?? "",
		language: repo.language ?? "",
		stars: repo.stargazers_count ?? 0,
		forks: repo.forks_count ?? 0,
		ownerAvatar: repo.owner?.avatar_url ?? "",
	};
}

function serialize(key: string, repo: LiveRepo): string {
	const fields: Array<[string, string]> = [
		["fullName", JSON.stringify(repo.fullName)],
		["url", JSON.stringify(repo.url)],
		["description", JSON.stringify(repo.description)],
		["language", JSON.stringify(repo.language)],
		["stars", String(repo.stars)],
		["forks", String(repo.forks)],
		["ownerAvatar", JSON.stringify(repo.ownerAvatar)],
	];

	const body = fields
		.map(([name, value]) => `\t\t${name}: ${value},`)
		.join("\n");

	return `\t${JSON.stringify(key)}: {\n${body}\n\t},`;
}

function formatGeneratedFile() {
	try {
		execFileSync(
			"bunx",
			["biome", "format", "--write", fileURLToPath(OUTPUT_URL)],
			{
				stdio: ["ignore", "ignore", "pipe"],
			},
		);
	} catch {
		console.warn("[sync-github] biome format skipped (run `bun run format`)");
	}
}

async function main() {
	const token = resolveToken();
	const targets = [
		...new Set(
			[...currentProducts, ...pinnedProducts].map(
				(product) => product.nameWithOwner,
			),
		),
	];

	console.log(
		`[sync-github] fetching ${targets.length} repositories${
			token ? " (authenticated)" : " (unauthenticated, 60 req/h)"
		}`,
	);

	const results = await Promise.allSettled(
		targets.map(async (target) => {
			const repo = await fetchRepo(target, token);
			return { target, repo };
		}),
	);

	const next: Record<string, LiveRepo> = {};
	let fetched = 0;
	let reused = 0;

	for (const [index, result] of results.entries()) {
		const target = targets[index];
		const key = target.toLowerCase();

		if (result.status === "rejected") {
			const fallback = previousRepos[key];
			if (fallback) {
				next[key] = fallback;
				reused += 1;
				console.warn(`[sync-github] ! ${target}: ${result.reason}`);
				console.warn(`[sync-github]   kept last known good values`);
			} else {
				console.warn(`[sync-github] ! ${target}: ${result.reason}`);
				console.warn(
					`[sync-github]   no cached values, fallback literals in use`,
				);
			}
			continue;
		}

		const { repo } = result.value;
		next[key] = repo;
		fetched += 1;

		if (repo.fullName.toLowerCase() !== key) {
			console.warn(
				`[sync-github] ~ ${target} was renamed to ${repo.fullName} — update src/data/portfolio.ts`,
			);
		}
	}

	const entries = Object.keys(next)
		.sort()
		.map((key) => serialize(key, next[key]));

	const file = `// AUTO-GENERATED by scripts/sync-github.ts — do not edit by hand.
// Run \`bun run sync:github\` to refresh.
// Last synced: ${new Date().toISOString()}

export type LiveRepo = {
	fullName: string;
	url: string;
	description: string;
	language: string;
	stars: number;
	forks: number;
	ownerAvatar: string;
};

/** Keyed by the repo path declared in src/data/portfolio.ts, lowercased. */
export const githubRepos: Record<string, LiveRepo | undefined> = {
${entries.join("\n")}
};
`;

	writeFileSync(OUTPUT_URL, file);

	// Keep the generated file byte-identical to what `biome format` would emit,
	// so regenerating it never shows up as a formatting-only diff.
	formatGeneratedFile();

	console.log(
		`[sync-github] wrote ${Object.keys(next).length} entries (${fetched} fetched, ${reused} kept)`,
	);
}

await main();
