"use client";

/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
	AnimatePresence,
	type MotionValue,
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "#/lib/utils.ts";

export type FloatingDockItem = {
	title: string;
	icon?: ReactNode;
	hoverIcon?: ReactNode;
	hoverTitle?: string;
	href?: string;
	onClick?: () => void;
	custom?: ReactNode;
	showTitle?: boolean;
	dividerAfter?: boolean;
};

export const FloatingDock = ({
	items,
	desktopClassName,
	mobileClassName,
	variant = "default",
}: {
	items: FloatingDockItem[];
	desktopClassName?: string;
	mobileClassName?: string;
	variant?: "default" | "pill";
}) => {
	if (variant === "pill") {
		return <FloatingDockPill items={items} className={desktopClassName} />;
	}

	return (
		<>
			<FloatingDockDesktop items={items} className={desktopClassName} />
			<FloatingDockMobile items={items} className={mobileClassName} />
		</>
	);
};

const FloatingDockPill = ({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) => {
	const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
	const reduceMotion = useReducedMotion() ?? false;
	const dockEase = [0.22, 1, 0.36, 1] as const;

	return (
		<div className={cn("floating-dock-fixed-shell", className)}>
			<motion.nav
				aria-label="Quick actions"
				animate={{ opacity: 1, y: 0, scale: 1 }}
				className="floating-dock-pill"
				initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
				layout
				transition={
					reduceMotion ? { duration: 0 } : { duration: 0.45, ease: dockEase }
				}
			>
				{items.map((item) => {
					const hovered = hoveredTitle === item.title;
					const label = hovered ? (item.hoverTitle ?? item.title) : item.title;
					const icon = hovered ? (item.hoverIcon ?? item.icon) : item.icon;
					const itemTransition = reduceMotion
						? { duration: 0 }
						: { duration: 0.2, ease: dockEase };
					const content = item.custom ?? (
						<>
							{item.showTitle ? (
								<AnimatePresence initial={false} mode="wait">
									<motion.span
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										className="floating-dock-pill-label"
										exit={{ opacity: 0, y: -3, filter: "blur(2px)" }}
										initial={{ opacity: 0, y: 3, filter: "blur(2px)" }}
										key={label}
										layout
										transition={itemTransition}
									>
										{label}
									</motion.span>
								</AnimatePresence>
							) : null}
							{icon ? (
								<AnimatePresence initial={false} mode="wait">
									<motion.span
										aria-hidden="true"
										animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
										className="floating-dock-pill-icon"
										exit={{ opacity: 0, scale: 0.82, filter: "blur(2px)" }}
										initial={{ opacity: 0, scale: 0.82, filter: "blur(2px)" }}
										key={hovered && item.hoverIcon ? "hover-icon" : "icon"}
										transition={itemTransition}
									>
										{icon}
									</motion.span>
								</AnimatePresence>
							) : null}
						</>
					);
					const commonProps = {
						"aria-label": label,
						onMouseEnter: () => setHoveredTitle(item.title),
						onMouseLeave: () => setHoveredTitle(null),
					};

					return (
						<span className="floating-dock-pill-slot" key={item.title}>
							{item.custom ? (
								<span {...commonProps} className="floating-dock-pill-custom">
									{content}
								</span>
							) : item.href ? (
								<motion.a
									{...commonProps}
									className={cn(
										"floating-dock-pill-item",
										item.showTitle && "floating-dock-pill-item-labeled",
									)}
									href={item.href}
									onClick={item.onClick}
									rel="noreferrer"
									target={
										item.href.startsWith("mailto:") ? undefined : "_blank"
									}
									layout
									transition={itemTransition}
									whileHover={reduceMotion ? undefined : { y: -1 }}
									whileTap={reduceMotion ? undefined : { scale: 0.97 }}
								>
									{content}
								</motion.a>
							) : (
								<motion.button
									{...commonProps}
									className={cn(
										"floating-dock-pill-item",
										item.showTitle && "floating-dock-pill-item-labeled",
									)}
									onClick={item.onClick}
									type="button"
									layout
									transition={itemTransition}
									whileHover={reduceMotion ? undefined : { y: -1 }}
									whileTap={reduceMotion ? undefined : { scale: 0.97 }}
								>
									{content}
								</motion.button>
							)}
							{item.dividerAfter ? (
								<span
									aria-hidden="true"
									className="floating-dock-pill-divider"
								/>
							) : null}
						</span>
					);
				})}
			</motion.nav>
		</div>
	);
};

const FloatingDockMobile = ({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) => {
	const [open, setOpen] = useState(false);
	return (
		<div className={cn("relative block md:hidden", className)}>
			<AnimatePresence>
				{open && (
					<motion.div
						layoutId="nav"
						className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
					>
						{items.map((item, idx) => (
							<motion.div
								key={item.title}
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 10,
									transition: {
										delay: idx * 0.05,
									},
								}}
								transition={{ delay: (items.length - 1 - idx) * 0.05 }}
							>
								<a
									href={item.href}
									key={item.title}
									className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
								>
									<div className="h-4 w-4">{item.icon}</div>
								</a>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
			<button
				onClick={() => setOpen(!open)}
				className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
				type="button"
			>
				<IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
			</button>
		</div>
	);
};

const FloatingDockDesktop = ({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) => {
	const mouseX = useMotionValue(Infinity);
	return (
		<motion.div
			onMouseMove={(e) => mouseX.set(e.pageX)}
			onMouseLeave={() => mouseX.set(Infinity)}
			className={cn(
				"mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
				className,
			)}
		>
			{items.map((item) => (
				<IconContainer mouseX={mouseX} key={item.title} {...item} />
			))}
		</motion.div>
	);
};

function IconContainer({
	mouseX,
	title,
	icon,
	href,
}: {
	mouseX: MotionValue;
	title: string;
	icon?: ReactNode;
	href?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const distance = useTransform(mouseX, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

		return val - bounds.x - bounds.width / 2;
	});

	const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
	const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

	const widthTransformIcon = useTransform(
		distance,
		[-150, 0, 150],
		[20, 40, 20],
	);
	const heightTransformIcon = useTransform(
		distance,
		[-150, 0, 150],
		[20, 40, 20],
	);

	const width = useSpring(widthTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const height = useSpring(heightTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const widthIcon = useSpring(widthTransformIcon, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const heightIcon = useSpring(heightTransformIcon, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const [hovered, setHovered] = useState(false);

	return (
		<a href={href ?? "#"}>
			<motion.div
				ref={ref}
				style={{ width, height }}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
			>
				<AnimatePresence>
					{hovered && (
						<motion.div
							initial={{ opacity: 0, y: 10, x: "-50%" }}
							animate={{ opacity: 1, y: 0, x: "-50%" }}
							exit={{ opacity: 0, y: 2, x: "-50%" }}
							className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
						>
							{title}
						</motion.div>
					)}
				</AnimatePresence>
				<motion.div
					style={{ width: widthIcon, height: heightIcon }}
					className="flex items-center justify-center"
				>
					{icon}
				</motion.div>
			</motion.div>
		</a>
	);
}
