import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { GitHubActivity } from "#/components/ui/github-activity";
import { Skeleton } from "#/components/ui/skeleton";
import { siteConfig } from "#/data/portfolio";

const lightAccent = ["#dfdfdc", "#f7e5eb", "#edbdcc", "#d98ca8", "#bd597c"];
const darkAccent = ["#1f1f21", "#3b2730", "#5e3a48", "#8c596c", "#c77c98"];

function CalendarSkeleton() {
	return (
		<Skeleton
			aria-label="Loading GitHub activity"
			className="calendar-skeleton"
		/>
	);
}

export function ActivityCalendar() {
	const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		const root = document.documentElement;
		const updateScheme = () => {
			setColorScheme(root.classList.contains("dark") ? "dark" : "light");
		};
		const observer = new MutationObserver(updateScheme);

		updateScheme();
		observer.observe(root, { attributes: true, attributeFilter: ["class"] });

		return () => observer.disconnect();
	}, []);

	return (
		<div className="activity-viewport">
			<ClientOnly fallback={<CalendarSkeleton />}>
				<GitHubActivity
					accent={colorScheme === "dark" ? darkAccent : lightAccent}
					cellSize={12}
					className="github-activity-card bg-card dark:bg-card rounded-2xl"
					label="Top contributions in:"
					months={12}
					showMonths
					username={siteConfig.githubUsername}
				/>
			</ClientOnly>
		</div>
	);
}
