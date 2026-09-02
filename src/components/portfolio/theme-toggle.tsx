import { Moon, Sun } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useSwipeTheme } from "#/components/ui/swipe-theme-provider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
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
					onClick={() => triggerSwipe("left")}
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
