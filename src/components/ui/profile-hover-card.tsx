import { CalendarDays, Link2, MapPin } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { type ReactNode, useRef, useState } from "react";

import { cn } from "#/lib/utils";

export type ProfileMetaKind = "location" | "website" | "joined";

export type ProfileMeta = {
	kind: ProfileMetaKind;
	label: string;
	href?: string;
};

export type ProfileStat = {
	value: string;
	label: string;
};

export type ProfileData = {
	name: string;
	handle: string;
	profileUrl: string;
	avatarUrl: string;
	bannerUrl?: string;
	bio: string;
	meta: ProfileMeta[];
	stats: ProfileStat[];
};

const metaIcons: Record<ProfileMetaKind, typeof MapPin> = {
	location: MapPin,
	website: Link2,
	joined: CalendarDays,
};

export function formatCount(count: number) {
	if (count >= 1_000_000)
		return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	if (count >= 1_000)
		return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
	return count.toString();
}

/**
 * Trigger + popover shell shared by the X and GitHub cards. It owns the hover
 * and focus state, the 3D tilt, and the open direction. Callers supply whatever
 * body they need, so the two cards stay visually and behaviourally identical
 * without duplicating the interaction code.
 */
export function ProfileHoverCard({
	children,
	label,
	linkText,
	profileUrl,
	placement = "top",
	tiltMaxRotate = 4,
	onReveal,
	className,
	labelClassName,
	linkClassName,
	popoverClassName,
}: {
	children: ReactNode;
	label: string;
	linkText: string;
	profileUrl: string;
	/** Which side the popover opens toward. Use "bottom" near the page top. */
	placement?: "top" | "bottom";
	tiltMaxRotate?: number;
	/** Fires the first time the card is hovered or focused. */
	onReveal?: () => void;
	className?: string;
	labelClassName?: string;
	linkClassName?: string;
	popoverClassName?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLSpanElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLElement | null>(null);

	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const springX = useSpring(x, { stiffness: 300, damping: 20 });
	const springY = useSpring(y, { stiffness: 300, damping: 20 });
	const rotateX = useTransform(
		springY,
		(value) => tiltMaxRotate - ((value + 20) / 40) * (2 * tiltMaxRotate),
	);
	const rotateY = useTransform(
		springX,
		(value) => -tiltMaxRotate + ((value + 20) / 40) * (2 * tiltMaxRotate),
	);

	const trackTilt = (event: { clientX: number; clientY: number }) => {
		const bounds = activeRef.current?.getBoundingClientRect();
		if (!bounds) return;
		x.set(
			((event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)) *
				20,
		);
		y.set(
			((event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)) *
				20,
		);
	};

	const open = () => {
		onReveal?.();
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
		activeRef.current = null;
		x.set(0);
		y.set(0);
	};

	const openDown = placement === "bottom";

	return (
		<div className={cn("flex items-center gap-1.5", className)}>
			<span className={cn("transition-colors", labelClassName)}>{label}</span>
			{/** biome-ignore lint/a11y/noStaticElementInteractions: pointer wrapper
			 * mirrors the focus/blur state already handled by the inner anchor. */}
			<div
				className="relative flex w-max flex-col items-center [perspective:1000px]"
				onBlur={(event) => {
					if (event.currentTarget.contains(event.relatedTarget as Node)) return;
					close();
				}}
				onFocus={open}
				onMouseEnter={open}
				onMouseLeave={close}
			>
				<span className="cursor-pointer" ref={triggerRef}>
					<a
						href={profileUrl}
						onMouseEnter={() => {
							activeRef.current = triggerRef.current;
						}}
						onMouseMove={trackTilt}
						rel="noreferrer"
						target="_blank"
					>
						<span className={cn("transition-colors", linkClassName)}>
							{linkText}
						</span>
					</a>
				</span>

				<motion.div
					animate={isOpen ? "visible" : "hidden"}
					aria-hidden={!isOpen}
					className={cn(
						"absolute z-50 w-80 rounded-2xl border border-dashed p-4 shadow-xl backdrop-blur-md",
						// Invisible bridge so the pointer can travel from the link into
						// the card without crossing a dead gap.
						"after:absolute after:left-0 after:h-4 after:w-full",
						openDown
							? "top-full mt-4 after:bottom-full"
							: "bottom-full mb-4 after:top-full",
						popoverClassName,
					)}
					inert={!isOpen}
					initial="hidden"
					onMouseEnter={() => {
						activeRef.current = cardRef.current;
					}}
					onMouseMove={trackTilt}
					ref={cardRef}
					style={{
						rotateX,
						rotateY,
						transformStyle: "preserve-3d",
						transformOrigin: openDown ? "top center" : "bottom center",
					}}
					variants={{
						hidden: {
							opacity: 0,
							y: openDown ? -6 : 6,
							scale: 0.98,
							filter: "blur(2px)",
							pointerEvents: "none",
							transition: { duration: 0.15, ease: "easeIn" },
						},
						visible: {
							opacity: 1,
							y: 0,
							scale: 1,
							filter: "blur(0px)",
							pointerEvents: "auto",
							transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
						},
					}}
				>
					{children}
				</motion.div>
			</div>
		</div>
	);
}

/** Full profile layout: banner, avatar, bio, meta rows and follower stats. */
export function ProfileCardBody({
	badge,
	data,
}: {
	badge: ReactNode;
	data: ProfileData;
}) {
	return (
		<>
			<div className="profile-card-banner relative -mx-4 -mt-4 h-24 overflow-hidden rounded-t-2xl">
				{data.bannerUrl ? (
					<img
						alt=""
						className="h-full w-full object-cover"
						src={data.bannerUrl}
					/>
				) : (
					<div className="profile-card-banner-fallback h-full w-full" />
				)}
			</div>

			<div className="relative mb-2 flex items-start justify-between">
				<img
					alt=""
					className="profile-card-avatar relative z-10 -mt-8 h-16 w-16 rounded-full border-4 object-cover shadow-md"
					src={data.avatarUrl}
				/>
				<span className="profile-card-badge mt-2">{badge}</span>
			</div>

			<div className="flex flex-col text-left">
				<span className="profile-card-name text-base leading-snug font-semibold">
					{data.name}
				</span>
				<span className="profile-card-handle text-sm">{data.handle}</span>
			</div>

			{data.bio && (
				<p className="profile-card-bio mt-2 text-left text-sm leading-relaxed">
					{data.bio}
				</p>
			)}

			{data.meta.length > 0 && (
				<div className="profile-card-meta mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
					{data.meta.map((item) => {
						const MetaIcon = metaIcons[item.kind];
						return (
							<span
								className="flex items-center gap-1.5"
								key={`${item.kind}-${item.label}`}
							>
								<MetaIcon aria-hidden="true" className="h-3.5 w-3.5" />
								{item.href ? (
									<a
										className="profile-card-meta-link"
										href={item.href}
										rel="noreferrer"
										target="_blank"
									>
										{item.label}
									</a>
								) : (
									<span>{item.label}</span>
								)}
							</span>
						);
					})}
				</div>
			)}

			{data.stats.length > 0 && (
				<div className="profile-card-stats mt-2 flex gap-4 text-left text-sm">
					{data.stats.map((stat) => (
						<span className="flex gap-1" key={stat.label}>
							<strong className="profile-card-stat-value font-bold">
								{stat.value}
							</strong>
							<span>{stat.label}</span>
						</span>
					))}
				</div>
			)}
		</>
	);
}
