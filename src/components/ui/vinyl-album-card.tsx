import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "#/lib/utils";

export function VinylAlbumCard({
	title,
	artist,
	releaseType,
	year,
	coverImage,
	audioSrc,
	className,
}: {
	title: string;
	artist: string;
	releaseType: string;
	year: string;
	coverImage: string;
	audioSrc: string;
	className?: string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const isExpanded = isHovered || isPlaying;
	const reduceMotion = useReducedMotion();
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const audio = new Audio(audioSrc);
		audio.preload = "metadata";
		audioRef.current = audio;
		const handleEnded = () => setIsPlaying(false);
		const handleError = () => setIsPlaying(false);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);
		return () => {
			audio.pause();
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
			audioRef.current = null;
		};
	}, [audioSrc]);

	const togglePlayback = async () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			return;
		}
		try {
			await audio.play();
			setIsPlaying(true);
		} catch {
			setIsPlaying(false);
		}
	};

	return (
		<fieldset
			aria-label={`${title} by ${artist}`}
			className={cn("vinyl-player", className)}
			data-playing={isPlaying || undefined}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="vinyl-player-artwork">
				<motion.div
					animate={
						reduceMotion
							? { x: 0, rotate: 0 }
							: {
									x: isExpanded ? 86 : 0,
									rotate: isPlaying ? 360 : isExpanded ? 180 : 0,
								}
					}
					className="vinyl-record"
					transition={
						isPlaying
							? {
									x: { type: "spring", stiffness: 90, damping: 16 },
									rotate: { duration: 7, ease: "linear", repeat: Infinity },
								}
							: { type: "spring", stiffness: 90, damping: 16 }
					}
				>
					{Array.from({ length: 8 }, (_, index) => {
						const inset = `${8 + index * 8}px`;
						return (
							<span className="vinyl-groove" key={inset} style={{ inset }} />
						);
					})}
					<img alt="" className="vinyl-label" src={coverImage} />
					<span className="vinyl-hole" />
				</motion.div>
				<motion.div
					animate={
						reduceMotion
							? { rotate: 0, scale: 1, x: 0 }
							: {
									rotate: isExpanded ? -3 : 0,
									scale: isExpanded ? 0.98 : 1,
									x: isExpanded ? -13 : 0,
								}
					}
					className="vinyl-sleeve"
					transition={{ type: "spring", stiffness: 150, damping: 20 }}
				>
					<img alt={`${title} cover`} src={coverImage} />
				</motion.div>
			</div>
			<div className="vinyl-player-info">
				<div>
					<strong>{title}</strong>
					<span>
						{artist} · {releaseType} · {year}
					</span>
				</div>
				<button
					aria-label={isPlaying ? "Pause track" : `Play ${title}`}
					className="vinyl-play"
					onClick={(event) => {
						event.stopPropagation();
						void togglePlayback();
					}}
					type="button"
				>
					{isPlaying ? (
						<Pause aria-hidden="true" />
					) : (
						<Play aria-hidden="true" />
					)}
				</button>
			</div>
			{!isPlaying ? (
				<button
					aria-label={`Play ${title}`}
					className="vinyl-player-trigger"
					onClick={() => void togglePlayback()}
					type="button"
				>
					<span className="sr-only">Play {title}</span>
				</button>
			) : null}
		</fieldset>
	);
}

export default VinylAlbumCard;
