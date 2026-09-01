import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";

import { Skeleton } from "#/components/ui/skeleton";
import { siteConfig } from "#/data/portfolio";

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
			<div className="activity-calendar">
				<ClientOnly fallback={<CalendarSkeleton />}>
					<GitHubCalendar
						blockMargin={3}
						blockRadius={3}
						blockSize={13}
						colorScheme={colorScheme}
						errorMessage="GitHub activity is temporarily unavailable"
						fontSize={12}
						labels={{
							months: [
								"Jan",
								"Feb",
								"Mar",
								"Apr",
								"May",
								"Jun",
								"Jul",
								"Aug",
								"Sep",
								"Oct",
								"Nov",
								"Dec",
							],
							totalCount: "{{count}} contributions in the last year",
							legend: { less: "Less", more: "More" },
						}}
						showColorLegend={false}
						showWeekdayLabels={false}
						theme={{
							light: ["#dfdfdc", "#f7e5eb", "#edbdcc", "#d98ca8", "#bd597c"],
							dark: ["#1f1f21", "#3b2730", "#5e3a48", "#8c596c", "#c77c98"],
						}}
						tooltips={{
							activity: {
								text: (activity) =>
									`${activity.date}: ${activity.count} contributions`,
								withArrow: true,
							},
						}}
						username={siteConfig.githubUsername}
						year="last"
					/>
				</ClientOnly>
			</div>
		</div>
	);
}
