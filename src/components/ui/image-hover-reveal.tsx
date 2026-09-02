import {
	motion,
	useMotionTemplate,
	useReducedMotion,
	useSpring,
} from "motion/react";
import { type MouseEvent, useEffect, useRef } from "react";

import { cn } from "#/lib/utils";

type RevealDirection = "top" | "right" | "bottom" | "left";

export function ImageHoverReveal({
	src,
	overlaySrc = src,
	alt,
	className,
}: {
	src: string;
	overlaySrc?: string;
	alt: string;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const hoveredRef = useRef(false);
	const axisRef = useRef<"x" | "y">("x");
	const insetTop = useSpring(0, { stiffness: 420, damping: 34 });
	const insetRight = useSpring(0, { stiffness: 420, damping: 34 });
	const insetBottom = useSpring(0, { stiffness: 420, damping: 34 });
	const insetLeft = useSpring(0, { stiffness: 420, damping: 34 });
	const clipPath = useMotionTemplate`inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`;

	useEffect(() => {
		if (!ref.current) return;
		const bounds = ref.current.getBoundingClientRect();
		insetTop.set(bounds.height / 2);
		insetBottom.set(bounds.height / 2);
		insetLeft.set(bounds.width / 2);
		insetRight.set(bounds.width / 2);
	}, [insetBottom, insetLeft, insetRight, insetTop]);

	const getDirection = (event: MouseEvent<HTMLDivElement>): RevealDirection => {
		if (!ref.current) return "top";
		const bounds = ref.current.getBoundingClientRect();
		const x = event.clientX - bounds.left - bounds.width / 2;
		const y = event.clientY - bounds.top - bounds.height / 2;
		const angle = Math.atan2(y, x) * (180 / Math.PI);
		if (angle > -45 && angle <= 45) return "right";
		if (angle > 45 && angle <= 135) return "bottom";
		if (angle > -135 && angle <= -45) return "top";
		return "left";
	};

	const handleEnter = (event: MouseEvent<HTMLDivElement>) => {
		if (!ref.current) return;
		if (reduceMotion) return;
		const direction = getDirection(event);
		hoveredRef.current = true;
		const bounds = ref.current.getBoundingClientRect();
		const x = event.clientX - bounds.left;
		const y = event.clientY - bounds.top;
		axisRef.current = direction === "left" || direction === "right" ? "x" : "y";
		if (direction === "left" || direction === "right") {
			insetTop.jump(0);
			insetBottom.jump(0);
			insetLeft.jump(direction === "left" ? 0 : bounds.width);
			insetRight.jump(direction === "left" ? bounds.width : 0);
			insetLeft.set(x - 60);
			insetRight.set(bounds.width - x - 60);
		} else {
			insetLeft.jump(0);
			insetRight.jump(0);
			insetTop.jump(direction === "top" ? 0 : bounds.height);
			insetBottom.jump(direction === "top" ? bounds.height : 0);
			insetTop.set(y - 60);
			insetBottom.set(bounds.height - y - 60);
		}
	};

	const handleMove = (event: MouseEvent<HTMLDivElement>) => {
		if (reduceMotion || !ref.current || !hoveredRef.current) return;
		const bounds = ref.current.getBoundingClientRect();
		const x = event.clientX - bounds.left;
		const y = event.clientY - bounds.top;
		if (axisRef.current === "x") {
			insetLeft.set(x - 60);
			insetRight.set(bounds.width - x - 60);
		} else {
			insetTop.set(y - 60);
			insetBottom.set(bounds.height - y - 60);
		}
	};

	const handleLeave = (event: MouseEvent<HTMLDivElement>) => {
		if (reduceMotion || !ref.current) return;
		hoveredRef.current = false;
		const bounds = ref.current.getBoundingClientRect();
		const direction = getDirection(event);
		if (axisRef.current === "x") {
			insetLeft.set(direction === "left" ? 0 : bounds.width);
			insetRight.set(direction === "left" ? bounds.width : 0);
		} else {
			insetTop.set(direction === "top" ? 0 : bounds.height);
			insetBottom.set(direction === "top" ? bounds.height : 0);
		}
	};

	return (
		<div
			aria-label={alt}
			className={cn("relative overflow-hidden select-none", className)}
			onMouseEnter={handleEnter}
			onMouseMove={handleMove}
			onMouseLeave={handleLeave}
			ref={ref}
			role="img"
		>
			<img alt="" className="h-full w-full object-cover grayscale" src={src} />
			<motion.div
				className="pointer-events-none absolute inset-0"
				style={reduceMotion ? { clipPath: "inset(0)" } : { clipPath }}
			>
				<img alt="" className="h-full w-full object-cover" src={overlaySrc} />
			</motion.div>
		</div>
	);
}
