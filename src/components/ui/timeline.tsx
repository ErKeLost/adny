import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "#/lib/utils";

export type TimelinePreview = {
	title: ReactNode;
	body: ReactNode;
};

export type TimelineItem = {
	id: string;
	preview: TimelinePreview;
	content: ReactNode;
};

export type TimelineGroup = {
	id: string;
	label: string;
	active?: boolean;
	items: TimelineItem[];
};

/** @deprecated Use TimelineGroup. Kept so older call sites still type-check. */
export type TimelineEntry = TimelineGroup & {
	content?: ReactNode;
};

type HoveredTick = {
	id: string;
	x: number;
	y: number;
};

const useIsoLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PREVIEW_GAP = 16;
const PREVIEW_EDGE = 12;
const PREVIEW_MOTION = {
	duration: 0.16,
	ease: [0.16, 1, 0.3, 1] as const,
};

function TimelinePreviewCard({
	hovered,
	preview,
	reduceMotion,
}: {
	hovered: HoveredTick;
	preview: TimelinePreview;
	reduceMotion: boolean | null;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState({ left: hovered.x, top: hovered.y });

	useIsoLayoutEffect(() => {
		const node = ref.current;
		if (!node) return;

		const width = node.offsetWidth;
		const height = node.offsetHeight;
		let left = hovered.x + PREVIEW_GAP;
		let top = hovered.y - height / 2;

		if (left + width > window.innerWidth - PREVIEW_EDGE) {
			left = hovered.x - width - PREVIEW_GAP;
		}

		top = Math.min(
			Math.max(top, PREVIEW_EDGE),
			window.innerHeight - height - PREVIEW_EDGE,
		);

		setPos({ left, top });
	}, [hovered]);

	return createPortal(
		<div
			className="timeline-preview-layer"
			style={{ left: pos.left, top: pos.top }}
		>
			<motion.div
				animate={{ opacity: 1, y: 0, scale: 1 }}
				className="timeline-preview"
				exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
				initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
				ref={ref}
				transition={reduceMotion ? { duration: 0 } : PREVIEW_MOTION}
			>
				<p className="timeline-preview-title">{preview.title}</p>
				<div className="timeline-preview-body">{preview.body}</div>
			</motion.div>
		</div>,
		document.body,
	);
}

function Timeline({
	groups,
	className,
}: {
	groups: TimelineGroup[];
	className?: string;
}) {
	const reduceMotion = useReducedMotion();
	const items = groups.flatMap((group) =>
		group.items.map((item, index) => ({
			...item,
			active: Boolean(group.active && index === 0),
		})),
	);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [anchor, setAnchor] = useState<HoveredTick | null>(null);
	const closeTimer = useRef(0);

	const showPreview = (id: string, target: HTMLElement) => {
		window.clearTimeout(closeTimer.current);
		const rect = target.getBoundingClientRect();
		setHoveredId(id);
		setAnchor({
			id,
			x: rect.right,
			y: rect.top + rect.height / 2,
		});
	};

	const highlight = (id: string) => {
		window.clearTimeout(closeTimer.current);
		setHoveredId(id);
		setAnchor(null);
	};

	const hide = () => {
		window.clearTimeout(closeTimer.current);
		closeTimer.current = window.setTimeout(() => {
			setHoveredId(null);
			setAnchor(null);
		}, 80);
	};

	useEffect(() => () => window.clearTimeout(closeTimer.current), []);

	const hoveredItem = items.find((item) => item.id === anchor?.id);
	const scrollToItem = (id: string) => {
		document.getElementById(`timeline-${id}`)?.scrollIntoView({
			behavior: reduceMotion ? "auto" : "smooth",
			block: "center",
		});
	};

	return (
		<div className={cn("timeline-shell", className)}>
			<nav aria-label="Project overview" className="timeline-minimap">
				{items.map((item) => (
					<button
						aria-current={item.active ? "step" : undefined}
						aria-label={
							typeof item.preview.title === "string"
								? item.preview.title
								: item.id
						}
						className="timeline-tick"
						data-active={item.active || undefined}
						data-hovered={hoveredId === item.id || undefined}
						key={item.id}
						onBlur={hide}
						onClick={() => scrollToItem(item.id)}
						onFocus={(event) => showPreview(item.id, event.currentTarget)}
						onMouseEnter={(event) => showPreview(item.id, event.currentTarget)}
						onMouseLeave={hide}
						type="button"
					/>
				))}
			</nav>

			<div className="timeline-groups">
				{groups.map((group) => (
					<section
						aria-labelledby={`timeline-label-${group.id}`}
						className="timeline-group"
						data-active={group.active || undefined}
						key={group.id}
					>
						<h3 className="timeline-label" id={`timeline-label-${group.id}`}>
							{group.label}
						</h3>
						<div className="timeline-product-list">
							{group.items.map((item) => {
								return (
									// biome-ignore lint/a11y/noStaticElementInteractions: hover only syncs the minimap tick
									<div
										className="timeline-item"
										data-hovered={hoveredId === item.id || undefined}
										id={`timeline-${item.id}`}
										key={item.id}
										onMouseEnter={() => highlight(item.id)}
										onMouseLeave={hide}
									>
										{item.content}
									</div>
								);
							})}
						</div>
					</section>
				))}
			</div>

			<AnimatePresence>
				{anchor && hoveredItem ? (
					<TimelinePreviewCard
						hovered={anchor}
						preview={hoveredItem.preview}
						reduceMotion={reduceMotion}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}

const CurvedTimeline = Timeline;

export { CurvedTimeline, Timeline };
