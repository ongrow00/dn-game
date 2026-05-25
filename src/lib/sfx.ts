let clickAudio: HTMLAudioElement | undefined;
let vibrateInterval: ReturnType<typeof setInterval> | undefined;

export function playClick() {
	if (typeof window === 'undefined') return;
	if (!clickAudio) {
		clickAudio = new Audio('/JP/click.mp3');
	}
	clickAudio.currentTime = 0;
	clickAudio.play().catch(() => {});
	vibrate();
}

export function vibrate(ms = 30) {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(ms);
	}
}

const RING_PATTERN = [200, 100, 200, 1500];

export function startRingVibration() {
	if (typeof navigator === 'undefined' || !navigator.vibrate) return;
	navigator.vibrate(RING_PATTERN);
	vibrateInterval = setInterval(() => {
		navigator.vibrate(RING_PATTERN);
	}, 2000);
}

export function stopRingVibration() {
	if (vibrateInterval !== undefined) {
		clearInterval(vibrateInterval);
		vibrateInterval = undefined;
	}
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(0);
	}
}
