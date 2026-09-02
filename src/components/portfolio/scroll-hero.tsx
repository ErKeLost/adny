import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDownRight, GitBranch, Mail } from "lucide-react";
import type { MouseEvent } from "react";
import { useRef } from "react";

import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { siteConfig } from "#/data/portfolio";

import { ThemeToggle } from "./theme-toggle";
import { ThemedHeroCanvas } from "./themed-hero-canvas";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollHero() {
	const wrapRef = useRef<HTMLElement>(null);
	const pinRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const scrollToProjects = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		document.getElementById("projects")?.scrollIntoView({
			behavior: reduceMotion ? "auto" : "smooth",
			block: "start",
		});
		window.history.replaceState(null, "", "#projects");
	};

	useGSAP(
		() => {
			const media = gsap.matchMedia();

			media.add(
				{
					desktop: "(min-width: 768px)",
					motion: "(prefers-reduced-motion: no-preference)",
				},
				(context) => {
					const { desktop, motion } = context.conditions as {
						desktop: boolean;
						motion: boolean;
					};
					const targetScale = () => {
						const frameWidth =
							frameRef.current?.offsetWidth ?? window.innerWidth;
						const targetWidth = desktop
							? 896
							: document.documentElement.clientWidth - 40;
						return Math.min(1, targetWidth / frameWidth);
					};
					const shell = wrapRef.current?.parentElement;
					const reducedScale = desktop ? 0.92 : 0.96;
					const syncCollapseOffset = () => {
						const frameHeight =
							pinRef.current?.offsetHeight ?? window.innerHeight;
						const finalScale = motion ? targetScale() : reducedScale;
						const contentGap = desktop ? 28 : 20;
						const offset = Math.max(
							0,
							frameHeight * (1 - finalScale) - contentGap,
						);
						shell?.style.setProperty("--hero-collapse-offset", `${offset}px`);
					};

					syncCollapseOffset();

					if (!motion) {
						gsap.set(frameRef.current, {
							borderRadius: desktop ? 16 : 12,
							scale: reducedScale,
						});
						return () => shell?.style.removeProperty("--hero-collapse-offset");
					}

					gsap
						.timeline({
							scrollTrigger: {
								trigger: wrapRef.current,
								start: "top top",
								end: "+=90%",
								pin: pinRef.current,
								pinSpacing: true,
								scrub: 0.8,
								invalidateOnRefresh: true,
								onRefresh: syncCollapseOffset,
							},
						})
						.to(frameRef.current, {
							borderRadius: desktop ? 16 : 12,
							ease: "none",
							scale: targetScale,
						})
						.to(
							contentRef.current,
							{
								ease: "none",
								opacity: 0.88,
								y: desktop ? -10 : -5,
							},
							0,
						);

					return () => shell?.style.removeProperty("--hero-collapse-offset");
				},
			);

			return () => media.revert();
		},
		{ scope: wrapRef },
	);

	return (
		<section
			aria-label="ADNY portfolio hero"
			className="scroll-hero"
			ref={wrapRef}
		>
			<div className="scroll-hero-pin" ref={pinRef}>
				<div className="scroll-hero-frame" ref={frameRef}>
					<ThemedHeroCanvas />

					<div className="hero-bar">
						<span className="hero-wordmark">adny.me</span>
						<div className="hero-controls">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										asChild
										className="hero-icon-control"
										size="icon-sm"
										variant="ghost"
									>
										<a
											aria-label="GitHub"
											href={siteConfig.githubUrl}
											rel="noreferrer"
											target="_blank"
										>
											<GitBranch aria-hidden="true" />
										</a>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">GitHub</TooltipContent>
							</Tooltip>
							<ThemeToggle className="hero-icon-control" />
						</div>
					</div>

					<div className="scroll-hero-content" ref={contentRef}>
						<h1>{siteConfig.name}</h1>
						<p>
							{siteConfig.tagline}. Five years in full-stack development, now
							focused on AI products and agent design.
						</p>
						<div className="hero-actions">
							<Button asChild className="hero-primary" size="sm">
								<a href={`mailto:${siteConfig.email}`}>
									<Mail aria-hidden="true" />
									Email
								</a>
							</Button>
							<Button
								className="hero-secondary"
								onClick={scrollToProjects}
								size="sm"
								type="button"
								variant="outline"
							>
								Projects
								<ArrowDownRight aria-hidden="true" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
