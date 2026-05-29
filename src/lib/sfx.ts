let clickAudio: HTMLAudioElement | undefined;
let vibrateInterval: ReturnType<typeof setInterval> | undefined;
let ringAudio: HTMLAudioElement | undefined;
let ringUnlockHandlers: Array<{ type: string; handler: () => void }> = [];

const INCOMING_RING_SRC = '/JP/cell-phone-vibrate.mp3';

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
	stopRingVibration();
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

function detachRingUnlock() {
	for (const { type, handler } of ringUnlockHandlers) {
		window.removeEventListener(type, handler);
	}
	ringUnlockHandlers = [];
}

function attachRingUnlock() {
	detachRingUnlock();
	const handler = () => playIncomingRingAudio();
	for (const type of ['pointerdown', 'touchstart', 'click', 'keydown']) {
		window.addEventListener(type, handler, { passive: true });
		ringUnlockHandlers.push({ type, handler });
	}
}

function playIncomingRingAudio() {
	if (!ringAudio) return;
	ringAudio.volume = 1;
	ringAudio
		.play()
		.then(() => detachRingUnlock())
		.catch(() => {});
}

/** Toque + vibração de chamada recebida (cell-phone-vibrate.mp3) */
export function startIncomingRing(src = INCOMING_RING_SRC) {
	if (typeof window === 'undefined') return;

	stopIncomingRing();

	startRingVibration();

	ringAudio = new Audio(src);
	ringAudio.loop = true;
	ringAudio.preload = 'auto';
	ringAudio.volume = 1;

	playIncomingRingAudio();
	attachRingUnlock();
}

/** Libera o toque após bloqueio de autoplay (toque na tela) */
export function unlockIncomingRing() {
	playIncomingRingAudio();
	startRingVibration();
}

export function stopIncomingRing() {
	detachRingUnlock();
	stopRingVibration();

	if (ringAudio) {
		ringAudio.pause();
		ringAudio.currentTime = 0;
		ringAudio = undefined;
	}
}
