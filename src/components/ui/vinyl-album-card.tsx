import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "#/lib/utils";

type VinylLoop = {
	context: AudioContext;
	pause: () => Promise<void>;
	play: () => Promise<void>;
	stop: () => Promise<void>;
};

function createVinylLoop(): VinylLoop {
	const AudioContextConstructor = window.AudioContext;
	const context = new AudioContextConstructor();
	const master = context.createGain();
	master.gain.value = 0.18;
	master.connect(context.destination);

	const noiseBuffer = context.createBuffer(
		1,
		context.sampleRate * 0.28,
		context.sampleRate,
	);
	const data = noiseBuffer.getChannelData(0);
	for (let index = 0; index < data.length; index += 1) {
		data[index] = Math.random() * 2 - 1;
	}

	let timer = 0;
	let nextStepTime = 0;
	let step = 0;
	let active = false;
	const stepDuration = 60 / 92 / 4;

	const envelope = (
		gain: GainNode,
		time: number,
		peak: number,
		release: number,
	) => {
		gain.gain.setValueAtTime(0.0001, time);
		gain.gain.exponentialRampToValueAtTime(peak, time + 0.008);
		gain.gain.exponentialRampToValueAtTime(0.0001, time + release);
	};

	const kick = (time: number) => {
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(128, time);
		oscillator.frequency.exponentialRampToValueAtTime(46, time + 0.18);
		envelope(gain, time, 0.84, 0.23);
		oscillator.connect(gain).connect(master);
		oscillator.start(time);
		oscillator.stop(time + 0.25);
	};

	const noiseHit = (
		time: number,
		frequency: number,
		peak: number,
		release: number,
	) => {
		const source = context.createBufferSource();
		const filter = context.createBiquadFilter();
		const gain = context.createGain();
		source.buffer = noiseBuffer;
		filter.type = "bandpass";
		filter.frequency.value = frequency;
		filter.Q.value = 0.7;
		envelope(gain, time, peak, release);
		source.connect(filter).connect(gain).connect(master);
		source.start(time);
		source.stop(time + release + 0.04);
	};

	const bass = (time: number, note: number) => {
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = "triangle";
		oscillator.frequency.value = note;
		envelope(gain, time, 0.2, 0.3);
		oscillator.connect(gain).connect(master);
		oscillator.start(time);
		oscillator.stop(time + 0.33);
	};

	const scheduleStep = () => {
		const time = nextStepTime;
		const grooveStep = step % 16;
		if ([0, 6, 8, 14].includes(grooveStep)) kick(time);
		if ([4, 12].includes(grooveStep)) noiseHit(time, 1800, 0.14, 0.16);
		if (grooveStep % 2 === 0) noiseHit(time, 6800, 0.035, 0.045);
		if ([0, 3, 8, 11].includes(grooveStep)) {
			bass(time, [55, 65.41, 73.42, 82.41][Math.floor(grooveStep / 3) % 4]);
		}
		if (grooveStep === 10) noiseHit(time, 420, 0.016, 0.12);
		step += 1;
		nextStepTime += stepDuration;
	};

	const schedule = () => {
		while (nextStepTime < context.currentTime + 0.12) scheduleStep();
	};

	return {
		context,
		async play() {
			await context.resume();
			if (active) return;
			active = true;
			nextStepTime = context.currentTime + 0.04;
			timer = window.setInterval(schedule, 48);
			schedule();
		},
		async pause() {
			if (!active) return;
			active = false;
			window.clearInterval(timer);
			await context.suspend();
		},
		async stop() {
			active = false;
			window.clearInterval(timer);
			await context.close();
		},
	};
}

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
	audioSrc?: string;
	className?: string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const isExpanded = isHovered || isPlaying;
	const reduceMotion = useReducedMotion();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const loopRef = useRef<VinylLoop | null>(null);

	useEffect(() => {
		if (audioSrc) {
			const audio = new Audio(audioSrc);
			audioRef.current = audio;
			const handleEnded = () => setIsPlaying(false);
			audio.addEventListener("ended", handleEnded);
			return () => {
				audio.pause();
				audio.removeEventListener("ended", handleEnded);
				audioRef.current = null;
			};
		}

		loopRef.current = createVinylLoop();
		return () => {
			void loopRef.current?.stop();
			loopRef.current = null;
		};
	}, [audioSrc]);

	const togglePlayback = async () => {
		const audio = audioRef.current;
		if (!audio && !loopRef.current) return;
		if (isPlaying) {
			if (audio) audio.pause();
			else await loopRef.current?.pause();
			setIsPlaying(false);
			return;
		}
		try {
			if (audio) await audio.play();
			else await loopRef.current?.play();
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
			<button
				aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
				className="vinyl-player-artwork"
				onClick={togglePlayback}
				type="button"
			>
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
			</button>
			<div className="vinyl-player-info">
				<div>
					<strong>{title}</strong>
					<span>
						{artist} · {releaseType} · {year}
					</span>
				</div>
				<button
					aria-label={isPlaying ? "Pause track" : "Play track"}
					className="vinyl-play"
					onClick={togglePlayback}
					type="button"
				>
					{isPlaying ? (
						<Pause aria-hidden="true" />
					) : (
						<Play aria-hidden="true" />
					)}
				</button>
			</div>
		</fieldset>
	);
}

export default VinylAlbumCard;
