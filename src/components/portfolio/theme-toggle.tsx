import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const root = document.documentElement;
		const syncTheme = () => setIsDark(root.classList.contains("dark"));
		const observer = new MutationObserver(syncTheme);

		syncTheme();
		observer.observe(root, { attributes: true, attributeFilter: ["class"] });

		return () => observer.disconnect();
	}, []);

	const toggleTheme = () => {
		const nextIsDark = !isDark;
		document.documentElement.classList.toggle("dark", nextIsDark);
		window.localStorage.setItem("adny-theme", nextIsDark ? "dark" : "light");
		setIsDark(nextIsDark);
	};

	const label = isDark ? "Switch to light mode" : "Switch to dark mode";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={label}
					className={cn("icon-control", className)}
					onClick={toggleTheme}
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
