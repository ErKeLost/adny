import { useEffect, useState } from "react";

import {
	formatCount,
	ProfileCardBody,
	type ProfileData,
	ProfileHoverCard,
} from "#/components/ui/profile-hover-card";

const XIcon = ({ className }: { className?: string }) => (
	<svg aria-hidden="true" className={className} viewBox="0 0 24 24">
		<path
			d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
			fill="currentColor"
		/>
	</svg>
);

export function TwitterCard({
	username,
	name = "Twitter User",
	avatarUrl = "",
	joinedDate,
	text = "Follow me on",
	linkText = "X",
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
	joinedDate?: string;
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
	const profileUrl = href || `https://x.com/${username}`;
	const [shouldLoad, setShouldLoad] = useState(false);
	const [profile, setProfile] = useState<ProfileData>({
		name,
		handle: `@${username}`,
		profileUrl,
		avatarUrl,
		bio: "",
		meta: joinedDate ? [{ kind: "joined", label: joinedDate }] : [],
		stats: [],
	});

	// fxtwitter is only called once the card is actually revealed, so a page
	// load never reaches out to a third party on its own.
	useEffect(() => {
		if (!shouldLoad) return;
		const controller = new AbortController();

		fetch(`https://api.fxtwitter.com/${username}`, {
			signal: controller.signal,
		})
			.then((response) => response.json())
			.then((payload) => {
				const user = payload?.user;
				if (payload?.code !== 200 || !user) return;

				// fxtwitter returns the literal string "undefined" for empty fields
				// rather than omitting them.
				const clean = (value: unknown) =>
					typeof value === "string" && value && value !== "undefined"
						? value
						: "";

				setProfile({
					name: clean(user.name) || name,
					handle: `@${clean(user.screen_name) || username}`,
					profileUrl,
					avatarUrl:
						clean(user.avatar_url).replace("_normal", "_400x400") || avatarUrl,
					bannerUrl: clean(user.banner_url) || undefined,
					bio: clean(user.description),
					meta: [
						clean(user.location)
							? { kind: "location" as const, label: clean(user.location) }
							: null,
						user.website?.url
							? {
									kind: "website" as const,
									label: user.website.display_url,
									href: user.website.url,
								}
							: null,
						clean(user.joined)
							? {
									kind: "joined" as const,
									label: `Joined ${new Date(user.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
								}
							: joinedDate
								? { kind: "joined" as const, label: joinedDate }
								: null,
					].filter((item): item is NonNullable<typeof item> => item !== null),
					stats: [
						{ value: formatCount(user.following ?? 0), label: "Following" },
						{ value: formatCount(user.followers ?? 0), label: "Followers" },
					],
				});
			})
			.catch(() => {});

		return () => controller.abort();
	}, [shouldLoad, username, name, avatarUrl, joinedDate, profileUrl]);

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
			<ProfileCardBody badge={<XIcon className="h-5 w-5" />} data={profile} />
		</ProfileHoverCard>
	);
}

export default TwitterCard;
