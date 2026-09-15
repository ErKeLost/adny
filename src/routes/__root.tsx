import {
	createRootRoute,
	HeadContent,
	ScriptOnce,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SwipeThemeProvider } from "#/components/ui/swipe-theme-provider";
import { TooltipProvider } from "#/components/ui/tooltip";

import appCss from "../styles.css?url";

const themeScript = `(function(){try{var saved=localStorage.getItem('adny-theme');var theme=saved||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.classList.toggle('dark',theme==='dark');}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{ title: "ADNY - HowOne AI Coding Platform Architect" },
			{
				name: "description",
				content:
					"Technical lead and architecture owner for HowOne, an AI coding platform spanning agent runtime, sandboxed execution, and application delivery.",
			},
			{ name: "theme-color", content: "#0b0b0c" },
			{
				property: "og:title",
				content: "ADNY - HowOne AI Coding Platform Architect",
			},
			{
				property: "og:description",
				content:
					"HowOne technical lead building AI runtime, task orchestration, sandboxed execution, preview, versioning, and deployment.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: "https://adny.me/" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "canonical", href: "https://adny.me/" },
			{ rel: "preload", href: "/hero-pink.jpg", as: "image" },
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Person",
					name: "ADNY",
					url: "https://adny.me/",
					jobTitle: "AI Coding Platform Architect & Full-stack Engineer",
					sameAs: ["https://github.com/ErKeLost"],
				}),
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html className="dark" lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ScriptOnce>{themeScript}</ScriptOnce>
				<SwipeThemeProvider direction="left" angle={10}>
					<TooltipProvider>{children}</TooltipProvider>
				</SwipeThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
