import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";
export type SwipeDirection =
	| "left"
	| "right"
	| "top"
	| "bottom"
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

type ViewTransitionDocument = Document & {
	startViewTransition?: (callback: () => void) => {
		finished?: Promise<unknown>;
	};
};

type SwipeThemeContextValue = {
	theme: Theme;
	isAnimating: boolean;
	triggerSwipe: (direction?: SwipeDirection) => void;
};

const SwipeThemeContext = createContext<SwipeThemeContextValue | null>(null);

function getClipPath(direction: SwipeDirection, end: boolean, angle: number) {
	if (direction === "top-left") {
		return end ? "polygon(0 0, 200% 0, 0 200%)" : "polygon(0 0, 0 0, 0 0)";
	}
	if (direction === "top-right") {
		return end
			? "polygon(100% 0, -100% 0, 100% 200%)"
			: "polygon(100% 0, 100% 0, 100% 0)";
	}
	if (direction === "bottom-left") {
		return end
			? "polygon(0 100%, 200% 100%, 0 -100%)"
			: "polygon(0 100%, 0 100%, 0 100%)";
	}
	if (direction === "bottom-right") {
		return end
			? "polygon(100% 100%, -100% 100%, 100% -100%)"
			: "polygon(100% 100%, 100% 100%, 100% 100%)";
	}

	const vertical = direction === "top" || direction === "bottom";
	const reverse = direction === "right" || direction === "bottom";
	if (vertical) {
		return end
			? "polygon(0 -10%, 100% -10%, 100% 110%, 0 110%)"
			: reverse
				? "polygon(0 110%, 100% 110%, 100% 110%, 0 110%)"
				: "polygon(0 -10%, 100% -10%, 100% -10%, 0 -10%)";
	}
	const skew = Math.min(24, Math.max(-24, angle));
	const leadingBottom = -10 + skew;
	const trailingBottom = 110 + skew;
	if (end) {
		return `polygon(-10% 0, 110% 0, ${trailingBottom}% 100%, ${leadingBottom}% 100%)`;
	}
	return reverse
		? `polygon(110% 0, 110% 0, ${trailingBottom}% 100%, ${trailingBottom}% 100%)`
		: `polygon(-10% 0, -10% 0, ${leadingBottom}% 100%, ${leadingBottom}% 100%)`;
}

export function useSwipeTheme() {
	const context = useContext(SwipeThemeContext);
	if (!context) {
		throw new Error("useSwipeTheme must be used within SwipeThemeProvider");
	}
	return context;
}

export function SwipeThemeProvider({
	children,
	duration = 560,
	easing = "cubic-bezier(0.76, 0, 0.24, 1)",
	direction = "left",
	angle = 0,
}: {
	children: ReactNode;
	duration?: number;
	easing?: string;
	direction?: SwipeDirection;
	angle?: number;
}) {
	// This matches the server document. The startup script resolves a saved/system
	// preference before paint, then this effect brings the controls into sync.
	const [theme, setTheme] = useState<Theme>("dark");
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		setTheme(
			document.documentElement.classList.contains("dark") ? "dark" : "light",
		);
	}, []);

	const triggerSwipe = useCallback(
		(customDirection = direction) => {
			if (isAnimating || typeof document === "undefined") return;
			const nextTheme: Theme = theme === "dark" ? "light" : "dark";
			const root = document.documentElement;
			const applyTheme = () => {
				flushSync(() => setTheme(nextTheme));
				root.classList.toggle("dark", nextTheme === "dark");
				root.setAttribute("data-theme", nextTheme);
				window.localStorage.setItem("adny-theme", nextTheme);
			};
			const viewTransitionDocument = document as ViewTransitionDocument;
			const reducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;

			if (!viewTransitionDocument.startViewTransition || reducedMotion) {
				applyTheme();
				return;
			}

			setIsAnimating(true);
			const style = document.createElement("style");
			style.textContent = `
        @keyframes adny-theme-swipe {
          from { clip-path: ${getClipPath(customDirection, false, angle)}; }
          to { clip-path: ${getClipPath(customDirection, true, angle)}; }
        }
        ::view-transition-old(root), ::view-transition-new(root) {
          animation: none !important;
          mix-blend-mode: normal !important;
        }
        ::view-transition-new(root) {
          animation: adny-theme-swipe ${duration}ms ${easing} both !important;
        }
      `;
			document.head.appendChild(style);
			const transition = viewTransitionDocument.startViewTransition(applyTheme);
			const cleanup = () => {
				style.remove();
				setIsAnimating(false);
			};
			transition.finished?.then(cleanup, cleanup) ??
				window.setTimeout(cleanup, duration);
		},
		[angle, direction, duration, easing, isAnimating, theme],
	);

	const value = useMemo(
		() => ({ theme, isAnimating, triggerSwipe }),
		[theme, isAnimating, triggerSwipe],
	);

	return (
		<SwipeThemeContext.Provider value={value}>
			{children}
		</SwipeThemeContext.Provider>
	);
}
