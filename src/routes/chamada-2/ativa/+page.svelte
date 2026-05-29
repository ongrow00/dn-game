<script lang="ts">
	import { onMount } from 'svelte';
	import { advanceTo } from '$lib/navigation';
	import { playClick } from '$lib/sfx';
	import { getPandaHeadLinks, PANDA_FACETIME_CALL } from '$lib/constants/panda';
	import { createWatchGuard, setPandaCurrentTime } from '$lib/panda-watch';

	const PANDA_API_SRC = 'https://player.pandavideo.com.br/api.v2.js';
	const panda = PANDA_FACETIME_CALL;

	type PandaPlayerEvent = {
		message: string;
		currentTime?: number;
		duration?: number;
	};

	type PandaPlayerInstance = {
		onEvent: (cb: (e: PandaPlayerEvent) => void) => void;
		play: () => void;
		getCurrentTime: () => number;
	};

	let elapsedSeconds = $state(0);
	let embedDurationSec = $state(panda.durationSec);
	let hasNavigated = false;
	let safetyTimer: ReturnType<typeof setTimeout> | undefined;
	let progressRafId: number | undefined;
	const watchGuard = createWatchGuard();

	function goToNext() {
		if (hasNavigated) return;
		hasNavigated = true;
		if (safetyTimer) clearTimeout(safetyTimer);
		stopProgressLoop();
		advanceTo('/acesso', 'video_end');
	}

	function handleHangUp() {
		playClick();
		if (watchGuard.canComplete(effectiveDuration())) {
			goToNext();
		}
	}

	function tryGoNext(duration: number) {
		if (hasNavigated || !watchGuard.canComplete(duration)) return;
		goToNext();
	}

	function trackWatchTime(currentTime: number) {
		if (!watchGuard.record(currentTime)) {
			setPandaCurrentTime(panda.iframeId, watchGuard.maxWatchedSec);
		}
	}

	function formatTimer(totalSeconds: number) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	function effectiveDuration(durationFromEvent?: number): number {
		if (typeof durationFromEvent === 'number' && durationFromEvent > 0) return durationFromEvent;
		return embedDurationSec || panda.durationSec;
	}

	function setEmbedDuration(durationSec: number) {
		if (!Number.isFinite(durationSec) || durationSec <= 0) return;
		embedDurationSec = durationSec;
		if (safetyTimer) clearTimeout(safetyTimer);
		safetyTimer = setTimeout(() => tryGoNext(durationSec), durationSec * 1000 + 3000);
	}

	function syncPlayback(message: string, currentTime = 0, durationFromEvent?: number) {
		if (typeof durationFromEvent === 'number' && durationFromEvent > 0) {
			setEmbedDuration(durationFromEvent);
		}

		const duration = effectiveDuration(durationFromEvent);
		if (message === 'panda_timeupdate' && duration > 0) {
			trackWatchTime(currentTime);
			tryGoNext(duration);
		}
		if (message === 'panda_ended') {
			tryGoNext(duration);
		}
		if (message === 'panda_seeked' || message === 'panda_seeking') {
			setPandaCurrentTime(panda.iframeId, watchGuard.maxWatchedSec);
		}
	}

	function stopProgressLoop() {
		if (progressRafId !== undefined) {
			cancelAnimationFrame(progressRafId);
			progressRafId = undefined;
		}
	}

	function startProgressLoop(getTime: () => number) {
		stopProgressLoop();
		const tick = () => {
			if (hasNavigated) return;
			const duration = effectiveDuration();
			const currentTime = getTime();
			if (duration > 0) {
				trackWatchTime(currentTime);
				tryGoNext(duration);
			}
			progressRafId = requestAnimationFrame(tick);
		};
		progressRafId = requestAnimationFrame(tick);
	}

	async function loadDurationFromHls() {
		try {
			const res = await fetch(panda.hlsUrl);
			if (!res.ok) return;
			const text = await res.text();
			let total = 0;
			for (const line of text.split('\n')) {
				if (line.startsWith('#EXTINF:')) {
					const sec = parseFloat(line.slice(8).split(',')[0]);
					if (!Number.isNaN(sec)) total += sec;
				}
			}
			if (total > 0) setEmbedDuration(total);
		} catch {
			/* ignore */
		}
	}

	function isPandaMessage(event: MessageEvent): boolean {
		try {
			const embedOrigin = new URL(panda.embedSrc).origin;
			if (event.origin === embedOrigin) return true;
		} catch {
			/* ignore */
		}
		return event.origin.includes('pandavideo.com.br');
	}

	function triggerPandaPlay() {
		const iframe = document.getElementById(panda.iframeId);
		if (!(iframe instanceof HTMLIFrameElement) || !iframe.contentWindow) return;
		iframe.contentWindow.postMessage({ type: 'play' }, '*');
	}

	function handlePandaMessage(event: MessageEvent) {
		if (!isPandaMessage(event)) return;
		const data = event.data;
		if (!data || typeof data !== 'object' || !('message' in data)) return;

		const message = data.message as string;
		if (message === 'panda_ready') triggerPandaPlay();

		const currentTime = typeof data.currentTime === 'number' ? data.currentTime : 0;
		const duration =
			typeof (data as Record<string, unknown>).duration === 'number'
				? ((data as Record<string, unknown>).duration as number)
				: undefined;

		syncPlayback(message, currentTime, duration);
	}

	function loadPandaApiScript(): Promise<void> {
		const w = window as Window & { PandaPlayer?: unknown };
		if (w.PandaPlayer) return Promise.resolve();

		return new Promise((resolve, reject) => {
			const existing = document.querySelector(`script[src="${PANDA_API_SRC}"]`);
			if (existing) {
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener('error', () => reject(), { once: true });
				return;
			}
			const script = document.createElement('script');
			script.src = PANDA_API_SRC;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject();
			document.head.appendChild(script);
		});
	}

	function initPandaPlayerApi() {
		return loadPandaApiScript()
			.then(
				() =>
					new Promise<boolean>((resolve) => {
						const w = window as unknown as {
							PandaPlayer?: new (
								id: string,
								opts: { onReady?: () => void; onError?: () => void }
							) => PandaPlayerInstance;
							pandascripttag?: Array<() => void>;
						};

						const PandaPlayer = w.PandaPlayer;
						if (!PandaPlayer) {
							resolve(false);
							return;
						}

						w.pandascripttag = w.pandascripttag || [];
						w.pandascripttag.push(() => {
							const player = new PandaPlayer(panda.iframeId, {
								onReady: () => {
									triggerPandaPlay();
									player.onEvent((e) => syncPlayback(e.message, e.currentTime, e.duration));
									startProgressLoop(() => player.getCurrentTime());
									resolve(true);
								},
								onError: () => resolve(false)
							});
						});
					})
			)
			.catch(() => false);
	}

	onMount(() => {
		watchGuard.reset();
		setEmbedDuration(panda.durationSec);
		void loadDurationFromHls();
		void initPandaPlayerApi();

		window.addEventListener('message', handlePandaMessage);

		const resumeOnGesture = () => triggerPandaPlay();
		window.addEventListener('pointerdown', resumeOnGesture, { once: true });
		window.addEventListener('keydown', resumeOnGesture, { once: true });

		const intervalId = setInterval(() => {
			elapsedSeconds += 1;
		}, 1000);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener('message', handlePandaMessage);
			window.removeEventListener('pointerdown', resumeOnGesture);
			window.removeEventListener('keydown', resumeOnGesture);
			stopProgressLoop();
			if (safetyTimer) clearTimeout(safetyTimer);
		};
	});
</script>

<svelte:head>
	<link rel="preload" href={PANDA_API_SRC} as="script" />
	{#each getPandaHeadLinks(panda) as link (link.href + link.rel)}
		{#if link.as}
			<link rel={link.rel} href={link.href} as={link.as} />
		{:else}
			<link rel={link.rel} href={link.href} />
		{/if}
	{/each}
</svelte:head>

<main class="call-screen call-screen--facetime call-screen--facetime-active" aria-label="FaceTime em andamento">
	<div class="facetime-active__video" aria-hidden="true">
		<div class="facetime-active__embed">
			<div class="facetime-active__embed-ratio">
				<iframe
					id={panda.iframeId}
					class="facetime-active__embed-frame"
					title="FaceTime — Detetive Eduardo"
					src={panda.embedSrc}
					allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
					allowfullscreen
					width="100%"
					height="100%"
				></iframe>
			</div>
		</div>
		<div class="facetime-active__video-shade"></div>
		<div class="facetime-active__shield" aria-hidden="true"></div>
	</div>

	<div class="facetime-active__pip" aria-hidden="true">
		<div class="facetime-active__pip-frame"></div>
	</div>

	<div class="facetime-active__content">
		<header class="facetime-active__header">
			<p class="facetime-active__app">FaceTime</p>
			<p class="facetime-active__name">Detetive Eduardo</p>
			<p class="facetime-active__timer" aria-live="polite">{formatTimer(elapsedSeconds)}</p>
		</header>

		<footer class="facetime-active__toolbar" aria-label="Controles do FaceTime">
			<button type="button" class="facetime-active__tool" aria-label="Desativar som">
				<span class="facetime-active__tool-btn">
					<svg viewBox="0 0 24 24" class="facetime-active__tool-icon">
						<path
							d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
							fill="currentColor"
						/>
						<path
							d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</button>

			<button
				type="button"
				class="facetime-active__tool facetime-active__tool--end"
				aria-label="Encerrar FaceTime"
				onclick={handleHangUp}
			>
				<span class="facetime-active__tool-btn facetime-active__tool-btn--end">
					<svg viewBox="0 0 24 24" class="facetime-active__tool-icon">
						<path
							d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</button>

			<button type="button" class="facetime-active__tool" aria-label="Virar câmera">
				<span class="facetime-active__tool-btn">
					<svg viewBox="0 0 24 24" class="facetime-active__tool-icon">
						<path
							d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</button>
		</footer>
	</div>
</main>
