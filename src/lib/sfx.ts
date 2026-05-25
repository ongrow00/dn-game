let clickAudio: HTMLAudioElement | undefined;

export function playClick() {
	if (typeof window === 'undefined') return;
	if (!clickAudio) {
		clickAudio = new Audio('/JP/click.mp3');
	}
	clickAudio.currentTime = 0;
	clickAudio.play().catch(() => {});
}
