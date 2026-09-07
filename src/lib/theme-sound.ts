// A short synthesized switch click, created only after a user gesture.
export function playThemeSound(toLight: boolean): void {
	if (typeof window === "undefined" || !window.AudioContext) return;
	let context: AudioContext | undefined;
	try {
		context = new AudioContext();
		const audio = context;
		const close = () => {
			window.clearTimeout(cleanupTimer);
			if (audio.state !== "closed") void audio.close().catch(() => {});
		};
		const cleanupTimer = window.setTimeout(close, 1500);
		void audio
			.resume()
			.then(() => {
				if (audio.state === "closed") return;
				const oscillator = audio.createOscillator();
				const gain = audio.createGain();
				const now = audio.currentTime;
				oscillator.type = "triangle";
				oscillator.frequency.setValueAtTime(toLight ? 820 : 610, now);
				oscillator.frequency.exponentialRampToValueAtTime(
					toLight ? 410 : 280,
					now + 0.055,
				);
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.035, now + 0.004);
				gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
				oscillator.connect(gain).connect(audio.destination);
				oscillator.onended = close;
				oscillator.start(now);
				oscillator.stop(now + 0.08);
			})
			.catch(close);
	} catch {
		void context?.close().catch(() => {});
	}
}
