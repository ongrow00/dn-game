<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		videoSrc: string;
		activeStoryIndex?: number;
		storyCount?: number;
		/** Início do trecho (ex.: segundo story dentro do mesmo .mov). */
		startTime?: number;
		onEnded?: () => void;
		ariaLabel?: string;
	}

	let {
		videoSrc,
		activeStoryIndex = 0,
		storyCount = 4,
		startTime = 0,
		onEnded,
		ariaLabel = 'Story Detective Night'
	}: Props = $props();

	let videoEl = $state<HTMLVideoElement | null>(null);
	let progress = $state(0);
	let hasEnded = false;

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

	onMount(() => {
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
	<video
		bind:this={videoEl}
		class="story-screen__video"
		src={videoSrc}
		playsinline
		preload="auto"
		ontimeupdate={handleTimeUpdate}
		onended={handleEnded}
	></video>

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
