import { useEffect, useRef } from "react";

const IMAGE_URL = "/hero-pink.jpg";
const THEME_TRANSITION_MS = 520;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function ThemedHeroCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d", { alpha: false });

		if (!canvas || !context) return;

		const root = document.documentElement;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const image = new Image();
		let imageReady = false;
		let animationFrame = 0;
		let darkMix = root.classList.contains("dark") ? 1 : 0;

		const render = () => {
			if (!imageReady) return;

			const bounds = canvas.getBoundingClientRect();
			const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
			const outputWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
			const outputHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

			if (canvas.width !== outputWidth || canvas.height !== outputHeight) {
				canvas.width = outputWidth;
				canvas.height = outputHeight;
			}

			const sourceAspect = image.naturalWidth / image.naturalHeight;
			const targetAspect = outputWidth / outputHeight;
			let sourceWidth = image.naturalWidth;
			let sourceHeight = image.naturalHeight;
			let sourceX = 0;
			let sourceY = 0;

			if (sourceAspect > targetAspect) {
				sourceWidth = image.naturalHeight * targetAspect;
				const focusX = bounds.width < 768 ? 0.8 : 0.5;
				sourceX = clamp(
					image.naturalWidth * focusX - sourceWidth / 2,
					0,
					image.naturalWidth - sourceWidth,
				);
			} else {
				sourceHeight = image.naturalWidth / targetAspect;
				sourceY = (image.naturalHeight - sourceHeight) / 2;
			}

			const brightness = 1 - darkMix * 0.5;
			const saturation = 1 - darkMix * 0.28;
			const contrast = 1 + darkMix * 0.08;

			context.save();
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, outputWidth, outputHeight);
			context.filter = `brightness(${brightness}) saturate(${saturation}) contrast(${contrast})`;
			context.drawImage(
				image,
				sourceX,
				sourceY,
				sourceWidth,
				sourceHeight,
				0,
				0,
				outputWidth,
				outputHeight,
			);
			context.filter = "none";

			const scrim = context.createLinearGradient(0, 0, 0, outputHeight);
			scrim.addColorStop(0, `rgba(5, 8, 12, ${0.1 + darkMix * 0.08})`);
			scrim.addColorStop(0.5, `rgba(5, 8, 12, ${0.03 + darkMix * 0.08})`);
			scrim.addColorStop(1, `rgba(5, 8, 12, ${0.5 + darkMix * 0.12})`);
			context.fillStyle = scrim;
			context.fillRect(0, 0, outputWidth, outputHeight);
			context.restore();
		};

		const syncTheme = () => {
			const targetMix = root.classList.contains("dark") ? 1 : 0;
			cancelAnimationFrame(animationFrame);

			if (reduceMotion.matches) {
				darkMix = targetMix;
				render();
				return;
			}

			const startMix = darkMix;
			const startTime = performance.now();

			const tick = (now: number) => {
				const progress = clamp((now - startTime) / THEME_TRANSITION_MS, 0, 1);
				const eased = 1 - (1 - progress) ** 4;
				darkMix = startMix + (targetMix - startMix) * eased;
				render();

				if (progress < 1) animationFrame = requestAnimationFrame(tick);
			};

			animationFrame = requestAnimationFrame(tick);
		};

		const resizeObserver = new ResizeObserver(render);
		const themeObserver = new MutationObserver(syncTheme);
		const handleImageLoad = () => {
			imageReady = true;
			render();
		};

		image.decoding = "async";
		image.fetchPriority = "high";
		image.addEventListener("load", handleImageLoad);
		image.src = IMAGE_URL;
		resizeObserver.observe(canvas);
		themeObserver.observe(root, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			image.removeEventListener("load", handleImageLoad);
			resizeObserver.disconnect();
			themeObserver.disconnect();
		};
	}, []);

	return (
		<canvas
			aria-label="An astronaut crossing a pink field beneath distant planets"
			className="hero-canvas"
			ref={canvasRef}
			role="img"
		/>
	);
}
