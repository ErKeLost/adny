import { Icon } from "@iconify/react";
import githubIcon from "@iconify-icons/simple-icons/github";
import { useEffect, useMemo, useState } from "react";

import { ProfileHoverCard } from "#/components/ui/profile-hover-card";

const CELL_COUNT = 119;

type Contribution = { date: string; count: number; level: number };

/**
 * Placeholder grid so the popover has its final size before data arrives and
 * the layout does not jump when contributions load.
 */
function emptyContributions(): Contribution[] {
	return Array.from({ length: CELL_COUNT }, () => ({
		date: "",
		count: 0,
		level: 0,
	}));
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function GitHubCard({
	username,
	name = username,
	avatarUrl,
	text = "Find me on",
	linkText = "GitHub",
	href,
	placement = "top",
	tiltMaxRotate = 4,
	className,
	labelClassName,
	linkClassName,
	popoverClassName,
}: {
	username: string;
	name?: string;
	avatarUrl?: string;
	text?: string;
	linkText?: string;
	href?: string;
	placement?: "top" | "bottom";
	tiltMaxRotate?: number;
	className?: string;
	labelClassName?: string;
	linkClassName?: string;
	popoverClassName?: string;
}) {
	const profileUrl = href || `https://github.com/${username}`;
	const [shouldLoad, setShouldLoad] = useState(false);
	const [profile, setProfile] = useState({
		name,
		avatarUrl: avatarUrl || `https://github.com/${username}.png`,
	});
	const [contributions, setContributions] =
		useState<Contribution[]>(emptyContributions);
	const [loaded, setLoaded] = useState(false);

	// Both endpoints are unauthenticated and rate limited per IP, so they are
	// only called once the card is actually revealed.
	useEffect(() => {
		if (!shouldLoad) return;
		const controller = new AbortController();

		fetch(`https://api.github.com/users/${username}`, {
			headers: { Accept: "application/vnd.github+json" },
			signal: controller.signal,
		})
			.then((response) => (response.ok ? response.json() : null))
			.then((user) => {
				if (!user) return;
				setProfile({
					name: user.name || user.login || name,
					avatarUrl:
						user.avatar_url ||
						avatarUrl ||
						`https://github.com/${username}.png`,
				});
			})
			.catch(() => {});

		fetch(`https://github-contributions-api.jogruber.de/v4/${username}`, {
			signal: controller.signal,
		})
			.then((response) => (response.ok ? response.json() : null))
			.then((payload) => {
				const all: Contribution[] = payload?.contributions ?? [];
				if (all.length === 0) return;
				const now = Date.now();
				const past = all
					.filter((day) => new Date(day.date).getTime() <= now)
					.sort(
						(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
					);
				setContributions(past.slice(-CELL_COUNT));
				setLoaded(true);
			})
			.catch(() => {});

		return () => controller.abort();
	}, [shouldLoad, username, name, avatarUrl]);

	const total = useMemo(
		() => contributions.reduce((sum, day) => sum + day.count, 0),
		[contributions],
	);

	return (
		<ProfileHoverCard
			className={className}
			label={text}
			labelClassName={labelClassName}
			linkClassName={linkClassName}
			linkText={linkText}
			onReveal={() => setShouldLoad(true)}
			placement={placement}
			popoverClassName={popoverClassName}
			profileUrl={profileUrl}
			tiltMaxRotate={tiltMaxRotate}
		>
			<div className="mb-4 flex items-center gap-3">
				<img
					alt=""
					className="profile-card-avatar h-12 w-12 rounded-full border object-cover"
					src={profile.avatarUrl}
				/>
				<span className="flex min-w-0 flex-col text-left">
					<span className="profile-card-name text-base leading-snug font-semibold">
						{profile.name}
					</span>
					<span className="profile-card-handle text-sm">@{username}</span>
				</span>
				<Icon
					aria-hidden="true"
					className="profile-card-badge ml-auto h-5 w-5 self-start"
					icon={githubIcon}
				/>
			</div>

			<div className="calendar-grid mx-auto grid w-max grid-flow-col grid-rows-7 gap-1 select-none">
				{contributions.map((day, index) => (
					<span
						className="calendar-cell"
						data-level={day.date ? day.level : undefined}
						key={day.date || `empty-${index}`}
					>
						{day.date && (
							<span className="calendar-tooltip">
								{day.count} contributions on {formatDate(day.date)}
							</span>
						)}
					</span>
				))}
			</div>

			<span className="calendar-total mt-3 block text-left text-xs">
				{loaded
					? `${total.toLocaleString()} contributions in the last 17 weeks`
					: "Loading contributions"}
			</span>
		</ProfileHoverCard>
	);
}

export default GitHubCard;
