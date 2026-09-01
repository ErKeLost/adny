import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

export type TimelineEntry = {
	id: string;
	label: string;
	active?: boolean;
	content: ReactNode;
};

function Timeline({
	entries,
	className,
}: {
	entries: TimelineEntry[];
	className?: string;
}) {
	return (
		<ol className={cn("timeline", className)} data-slot="timeline">
			{entries.map((entry) => (
				<li
					className="timeline-entry"
					data-active={entry.active || undefined}
					key={entry.id}
				>
					<div className="timeline-axis" aria-hidden="true">
						<span className="timeline-marker" />
					</div>
					<p className="timeline-label">{entry.label}</p>
					<div className="timeline-content">{entry.content}</div>
				</li>
			))}
		</ol>
	);
}

export { Timeline };
