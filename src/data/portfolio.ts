export type Product = {
	name: string;
	nameWithOwner: string;
	url: string;
	description: string;
	language: string;
	languageColor: string;
	stars: number;
	forks: number;
	ownerAvatar: string;
};

export const siteConfig = {
	name: "ADNY",
	role: "Coding Agent Engineer & AI Product Designer",
	tagline: "Researching, designing, and building coding agents",
	bio: "Day by day. Through and through.",
	status: "Growing up",
	domain: "adny.me",
	email: "hello@adny.me",
	githubUsername: "ErKeLost",
	githubUrl: "https://github.com/ErKeLost?tab=repositories",
	avatarUrl:
		"https://avatars.githubusercontent.com/u/66500121?s=260&u=119f691b72af40b20205a4c272112fa8046cfa5e&v=4",
};

export const currentProducts: Product[] = [
	{
		name: "Open Artifex",
		nameWithOwner: "ErKeLost/open-artifex",
		url: "https://github.com/ErKeLost/open-artifex",
		description:
			"Local-first desktop agent with separate coding and everyday work workflows, built around focused task execution.",
		language: "Go",
		languageColor: "#00ADD8",
		stars: 0,
		forks: 0,
		ownerAvatar: siteConfig.avatarUrl,
	},
	{
		name: "Open Tessera",
		nameWithOwner: "ErKeLost/Tessera",
		url: "https://github.com/ErKeLost/Tessera",
		description:
			"Local-first data analysis agent for governed tool use, verified evidence, and reproducible analysis views.",
		language: "TypeScript",
		languageColor: "#3178c6",
		stars: 2,
		forks: 0,
		ownerAvatar: siteConfig.avatarUrl,
	},
	{
		name: "Open Generative",
		nameWithOwner: "ErKeLost/open-generative",
		url: "https://github.com/ErKeLost/open-generative",
		description:
			"Generative UI foundation for agent-driven interfaces across protocol, runtime, React, AI SDK, and Mastra.",
		language: "TypeScript",
		languageColor: "#3178c6",
		stars: 0,
		forks: 0,
		ownerAvatar: siteConfig.avatarUrl,
	},
];

export const pinnedProducts: Product[] = [
	{
		name: "Farm",
		nameWithOwner: "farm-fe/farm",
		url: "https://github.com/farm-fe/farm",
		description:
			"Extremely fast Vite-compatible web build tool written in Rust.",
		language: "Rust",
		languageColor: "#dea584",
		stars: 5590,
		forks: 191,
		ownerAvatar: "https://avatars.githubusercontent.com/u/108205785?s=64&v=4",
	},
	{
		name: "Varlet",
		nameWithOwner: "varletjs/varlet",
		url: "https://github.com/varletjs/varlet",
		description:
			"Vue 3 component library based on Material Design 2 and 3 for mobile and desktop.",
		language: "Vue",
		languageColor: "#41b883",
		stars: 5333,
		forks: 623,
		ownerAvatar: "https://avatars.githubusercontent.com/u/97020275?s=64&v=4",
	},
	{
		name: "Fervid",
		nameWithOwner: "phoenix-ru/fervid",
		url: "https://github.com/phoenix-ru/fervid",
		description: "All-in-One Vue compiler written in Rust.",
		language: "Rust",
		languageColor: "#dea584",
		stars: 428,
		forks: 13,
		ownerAvatar:
			"https://avatars.githubusercontent.com/u/18054980?s=64&u=5ca24c79005ca78e18527cc624108f22fe54be72&v=4",
	},
	{
		name: "Unplugin Imagemin",
		nameWithOwner: "unplugin/unplugin-imagemin",
		url: "https://github.com/unplugin/unplugin-imagemin",
		description: "Image compression plugin based on squoosh-next.",
		language: "TypeScript",
		languageColor: "#3178c6",
		stars: 261,
		forks: 24,
		ownerAvatar: "https://avatars.githubusercontent.com/u/143585159?s=64&v=4",
	},
	{
		name: "Rolldown",
		nameWithOwner: "rolldown/rolldown",
		url: "https://github.com/rolldown/rolldown",
		description:
			"Fast Rust bundler for JavaScript and TypeScript with Rollup-compatible API.",
		language: "Rust",
		languageColor: "#dea584",
		stars: 13925,
		forks: 1042,
		ownerAvatar: "https://avatars.githubusercontent.com/u/94954945?s=64&v=4",
	},
	{
		name: "Create Vite App",
		nameWithOwner: "ErKeLost/create-vite-app",
		url: "https://github.com/ErKeLost/create-vite-app",
		description:
			"Vite CLI for quickly creating customized Vue and React starter templates.",
		language: "TypeScript",
		languageColor: "#3178c6",
		stars: 247,
		forks: 31,
		ownerAvatar: siteConfig.avatarUrl,
	},
];

export const skillGroups = [
	{
		name: "Agent Engineering",
		kind: "ai" as const,
		items: [
			"Agent Harnesses",
			"Tool Use",
			"Context Engineering",
			"Agent Runtime",
		],
	},
	{
		name: "AI Product Design",
		kind: "frontend" as const,
		items: ["Agent UX", "Human-AI Interaction", "Evaluation", "Generative UI"],
	},
	{
		name: "Data Analysis Agents",
		kind: "backend" as const,
		items: [
			"Governed Tools",
			"Evidence",
			"Analysis Views",
			"Local-first Systems",
		],
	},
	{
		name: "Full-stack Engineering",
		kind: "language" as const,
		items: [
			"TypeScript",
			"React",
			"Vue",
			"Node.js",
			"Rust",
			"Go",
			"Databases",
			"Cloud",
			"DevOps",
		],
	},
	{
		name: "Open-source Ecosystem",
		kind: "workflow" as const,
		items: ["Farm", "Rolldown", "Unplugin", "Varlet", "OpenTiny"],
	},
];
