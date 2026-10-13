import { Moon, Sun } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useSwipeTheme } from "#/components/ui/swipe-theme-provider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

export function ThemeToggle({
	className,
	suppressPointerFocus = false,
}: {
	className?: string;
	suppressPointerFocus?: boolean;
}) {
	const { theme, isAnimating, triggerSwipe } = useSwipeTheme();
	const isDark = theme === "dark";

	const label = isDark ? "Switch to light mode" : "Switch to dark mode";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={label}
					aria-busy={isAnimating}
					className={cn("icon-control", className)}
					disabled={isAnimating}
					onPointerDown={(event) => {
						// `pointerdown` only fires for mouse, pen and touch, so this can
						// never interfere with keyboard focus.
						if (suppressPointerFocus) {
							event.preventDefault();
						}
					}}
					onClick={() => {
						triggerSwipe("left");
					}}
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">{label}</TooltipContent>
		</Tooltip>
	);
}
