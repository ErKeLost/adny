import {
	type MotionValue,
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { type HTMLAttributes, useRef } from "react";

import { cn } from "#/lib/utils";

function FocusWord({
	word,
	index,
	total,
	progress,
	itemClassName,
}: {
	word: string;
	index: number;
	total: number;
	progress: MotionValue<number>;
	itemClassName?: string;
}) {
	const reduce = useReducedMotion();
	const start = (index / Math.max(1, total)) * 0.84;
	const end = Math.min(1, start + 0.13);
	const opacity = useTransform(progress, [start, end], [0.34, 1]);
	const scale = useTransform(progress, [start, end], [0.97, 1]);
	const blur = useTransform(progress, [start, end], [2.5, 0]);
	const filter = useTransform(blur, (value) =>
		value === 0 ? "none" : `blur(${value}px)`,
	);

	return (
		<motion.span
			className={cn("word-focus-word", itemClassName)}
			style={reduce ? undefined : { opacity, scale, filter }}
		>
			{word}
		</motion.span>
	);
}

export function WordFocusScroll({
	text,
	className,
	itemClassName,
	...props
}: { text: string; itemClassName?: string } & HTMLAttributes<HTMLDivElement>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start 90%", "end 62%"],
	});
	const words = text.split(" ").filter(Boolean);
	const wordKeys = new Map<string, number>();

	return (
		<div
			className={cn("word-focus-scroll", className)}
			ref={containerRef}
			{...props}
		>
			<div className="word-focus-content">
				{words.map((word, index) => {
					const occurrence = wordKeys.get(word) ?? 0;
					wordKeys.set(word, occurrence + 1);
					return (
						<FocusWord
							index={index}
							itemClassName={itemClassName}
							key={`${word}-${occurrence}`}
							progress={scrollYProgress}
							total={words.length}
							word={word}
						/>
					);
				})}
			</div>
		</div>
	);
}

export default WordFocusScroll;
