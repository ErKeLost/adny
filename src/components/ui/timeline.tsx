import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

export type TimelineEntry = {
	id: string;
	label: string;
	active?: boolean;
	content: ReactNode;
};

function CurvedTimeline({
	entries,
	className,
}: {
	entries: TimelineEntry[];
	className?: string;
}) {
	return (
		<ol
			className={cn("timeline curved-timeline", className)}
			data-slot="timeline"
		>
			{entries.map((entry) => (
				<li
					className="timeline-entry"
					data-active={entry.active || undefined}
					key={entry.id}
				>
					<div className="timeline-axis" aria-hidden="true">
						<span className="timeline-marker" />
						<svg
							aria-hidden="true"
							className="timeline-bend"
							preserveAspectRatio="none"
							viewBox="0 0 120 36"
						>
							<path d="M 4 6 C 4 21 20 30 40 30 H 118" />
						</svg>
					</div>
					<p className="timeline-label">{entry.label}</p>
					<div className="timeline-content">{entry.content}</div>
				</li>
			))}
		</ol>
	);
}

const Timeline = CurvedTimeline;

export { CurvedTimeline, Timeline };
