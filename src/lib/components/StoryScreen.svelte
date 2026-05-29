<script lang="ts">
	import { onMount } from 'svelte';

	const PANDA_API_SRC = 'https://player.pandavideo.com.br/api.v2.js';

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

	interface Props {
		videoSrc?: string;
		/** Embed Panda Video (ex.: primeiro story em /historia). */
		embedSrc?: string;
		pandaIframeId?: string;
		/** Playlist HLS para obter duração real do vídeo. */
		pandaHlsUrl?: string;
		/** Duração estimada (segundos) — barra de progresso e fallback de fim. */
		segmentDurationSec?: number;
		activeStoryIndex?: number;
		storyCount?: number;
		/** Início do trecho (ex.: segundo story dentro do mesmo .mov). */
		startTime?: number;
		onEnded?: () => void;
		ariaLabel?: string;
	}

	let {
		videoSrc,
		embedSrc,
		pandaIframeId,
		pandaHlsUrl,
		segmentDurationSec,
		activeStoryIndex = 0,
		storyCount = 4,
		startTime = 0,
		onEnded,
		ariaLabel = 'Story Detective Night'
	}: Props = $props();

	let videoEl = $state<HTMLVideoElement | null>(null);
	let progress = $state(0);
	let embedDurationSec = $state(0);
	let hasEnded = false;
	let safetyTimer: ReturnType<typeof setTimeout> | undefined;
	let progressRafId: number | undefined;
	const useEmbed = $derived(Boolean(embedSrc));

	function effectiveEmbedDuration(durationFromEvent?: number): number {
		if (typeof durationFromEvent === 'number' && durationFromEvent > 0) return durationFromEvent;
		return embedDurationSec || segmentDurationSec || 0;
	}

	function updateEmbedProgress(currentTime: number, durationFromEvent?: number) {
		const duration = effectiveEmbedDuration(durationFromEvent);
		if (duration <= 0 || hasEnded) return;

		progress = Math.min(1, Math.max(0, currentTime / duration));

		if (currentTime >= duration - 0.15) {
			progress = 1;
			handleEnded();
		}
	}

	async function loadDurationFromHls(url: string) {
		try {
			const res = await fetch(url);
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

	function startEmbedProgressLoop(getTime: () => number) {
		stopEmbedProgressLoop();

		const tick = () => {
			if (hasEnded) return;
			updateEmbedProgress(getTime());
			progressRafId = requestAnimationFrame(tick);
		};

		progressRafId = requestAnimationFrame(tick);
	}

	function stopEmbedProgressLoop() {
		if (progressRafId !== undefined) {
			cancelAnimationFrame(progressRafId);
			progressRafId = undefined;
		}
	}

	function armSafetyFallback(durationSec: number) {
		if (durationSec <= 0) return;
		if (safetyTimer) clearTimeout(safetyTimer);
		safetyTimer = setTimeout(() => handleEnded(), durationSec * 1000 + 3000);
	}

	function setEmbedDuration(durationSec: number) {
		if (!Number.isFinite(durationSec) || durationSec <= 0) return;
		if (Math.abs(embedDurationSec - durationSec) < 0.05) return;
		embedDurationSec = durationSec;
		armSafetyFallback(durationSec);
	}

	function syncEmbedPlayback(message: string, currentTime = 0, durationFromEvent?: number) {
		if (typeof durationFromEvent === 'number' && durationFromEvent > 0) {
			setEmbedDuration(durationFromEvent);
		}

		if (message === 'panda_timeupdate') {
			updateEmbedProgress(currentTime, durationFromEvent);
		}

		if (message === 'panda_ended') {
			progress = 1;
			handleEnded();
		}
	}

	function segmentDuration(): number {
		if (!videoEl || !Number.isFinite(videoEl.duration)) return 0;
		return Math.max(0, videoEl.duration - startTime);
	}

	function handleTimeUpdate() {
		if (!videoEl) return;
		const duration = segmentDuration();
		if (duration <= 0) return;
		const elapsed = videoEl.currentTime - startTime;
		progress = Math.min(1, Math.max(0, elapsed / duration));
	}

	function handleEnded() {
		if (hasEnded) return;
		hasEnded = true;
		stopEmbedProgressLoop();
		if (safetyTimer) {
			clearTimeout(safetyTimer);
			safetyTimer = undefined;
		}
		videoEl?.pause();
		onEnded?.();
	}

	function segmentFillWidth(index: number): string {
		if (index < activeStoryIndex) return '100%';
		if (index === activeStoryIndex) return `${progress * 100}%`;
		return '0%';
	}

	function beginPlayback() {
		if (!videoEl) return;
		if (startTime > 0) {
			videoEl.currentTime = startTime;
		} else {
			videoEl.currentTime = 0;
		}
		videoEl.play().catch(() => {
			const resume = () => {
				videoEl?.play().catch(() => {});
			};
			window.addEventListener('pointerdown', resume, { once: true });
			window.addEventListener('keydown', resume, { once: true });
		});
	}

	function isPandaMessage(event: MessageEvent): boolean {
		if (!embedSrc) return false;
		try {
			const embedOrigin = new URL(embedSrc).origin;
			if (event.origin === embedOrigin) return true;
		} catch {
			/* ignore */
		}
		return event.origin.includes('pandavideo.com.br');
	}

	function triggerPandaPlay() {
		if (!pandaIframeId) return;
		const iframe = document.getElementById(pandaIframeId);
		if (!(iframe instanceof HTMLIFrameElement) || !iframe.contentWindow) return;
		iframe.contentWindow.postMessage({ type: 'play' }, '*');
	}

	function handlePandaMessage(event: MessageEvent) {
		if (!useEmbed || !isPandaMessage(event)) return;

		const data = event.data;
		if (!data || typeof data !== 'object' || !('message' in data)) return;

		const message = data.message as string;

		if (message === 'panda_ready') {
			triggerPandaPlay();
		}

		const currentTime = typeof data.currentTime === 'number' ? data.currentTime : 0;
		const duration =
			typeof (data as Record<string, unknown>).duration === 'number'
				? ((data as Record<string, unknown>).duration as number)
				: undefined;

		syncEmbedPlayback(message, currentTime, duration);
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

	function initPandaPlayerApi(): Promise<boolean> {
		if (!pandaIframeId) return Promise.resolve(false);

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
							const player = new PandaPlayer(pandaIframeId, {
								onReady: () => {
									triggerPandaPlay();
									player.onEvent((e) => {
										syncEmbedPlayback(e.message, e.currentTime, e.duration);
									});
									startEmbedProgressLoop(() => player.getCurrentTime());
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
		if (useEmbed) {
			if (segmentDurationSec && segmentDurationSec > 0) {
				setEmbedDuration(segmentDurationSec);
			}
			if (pandaHlsUrl) {
				void loadDurationFromHls(pandaHlsUrl);
			}

			void initPandaPlayerApi();

			window.addEventListener('message', handlePandaMessage);

			const resumeOnGesture = () => triggerPandaPlay();
			window.addEventListener('pointerdown', resumeOnGesture, { once: true });
			window.addEventListener('keydown', resumeOnGesture, { once: true });

			return () => {
				window.removeEventListener('message', handlePandaMessage);
				window.removeEventListener('pointerdown', resumeOnGesture);
				window.removeEventListener('keydown', resumeOnGesture);
				stopEmbedProgressLoop();
				if (safetyTimer) clearTimeout(safetyTimer);
			};
		}

		if (!videoEl) return;

		const onReady = () => beginPlayback();

		if (videoEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
			onReady();
		} else {
			videoEl.addEventListener('loadedmetadata', onReady, { once: true });
		}

		return () => {
			videoEl?.pause();
		};
	});
</script>

<main class="story-screen" aria-label={ariaLabel}>
	{#if useEmbed && embedSrc}
		<div class="story-screen__embed">
			<iframe
				id={pandaIframeId}
				class="story-screen__embed-frame"
				title={ariaLabel}
				src={embedSrc}
				allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
				allowfullscreen
			></iframe>
		</div>
	{:else if videoSrc}
		<video
			bind:this={videoEl}
			class="story-screen__video"
			src={videoSrc}
			playsinline
			preload="auto"
			ontimeupdate={handleTimeUpdate}
			onended={handleEnded}
		></video>
	{/if}

	<div class="story-screen__overlay">
		<div class="story-screen__progress" aria-hidden="true">
			{#each Array(storyCount) as _, index}
				<div class="story-screen__progress-segment">
					<div class="story-screen__progress-fill" style:width={segmentFillWidth(index)}></div>
				</div>
			{/each}
		</div>

		<header class="story-screen__header">
			<img
				class="story-screen__avatar"
				src="/images/story-avatar.png"
				alt=""
				width="32"
				height="32"
			/>
			<span class="story-screen__username">Detective Night</span>
			<img
				class="story-screen__verified"
				src="/images/verified-badge.png"
				alt="Conta verificada"
				width="12"
				height="12"
			/>
		</header>
	</div>
</main>
