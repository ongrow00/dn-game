/** Tolerância para detectar avanço manual no player */
export const SEEK_TOLERANCE_SEC = 0.35;

/** Quanto antes do fim consideramos o vídeo completo */
export const COMPLETE_MARGIN_SEC = 0.25;

export function createWatchGuard() {
	let maxWatchedSec = 0;

	return {
		reset() {
			maxWatchedSec = 0;
		},
		get maxWatchedSec() {
			return maxWatchedSec;
		},
		/** Retorna false se o usuário pulou para frente */
		record(currentTime: number): boolean {
			if (!Number.isFinite(currentTime) || currentTime < 0) return true;
			if (currentTime > maxWatchedSec + SEEK_TOLERANCE_SEC) return false;
			if (currentTime > maxWatchedSec) maxWatchedSec = currentTime;
			return true;
		},
		canComplete(durationSec: number): boolean {
			return durationSec > 0 && maxWatchedSec >= durationSec - COMPLETE_MARGIN_SEC;
		}
	};
}

export function setPandaCurrentTime(iframeId: string, seconds: number) {
	const iframe = document.getElementById(iframeId);
	if (!(iframe instanceof HTMLIFrameElement) || !iframe.contentWindow) return;
	iframe.contentWindow.postMessage({ type: 'currentTime', parameter: seconds }, '*');
}
