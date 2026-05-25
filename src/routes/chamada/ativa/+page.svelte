<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { playClick } from '$lib/sfx';

	const CALL_AUDIO_SRC = '/JP/AD01.mp3';

	const controls = [
		{ id: 'mute', label: 'silenciar', icon: 'mute' },
		{ id: 'keypad', label: 'teclado', icon: 'keypad' },
		{ id: 'speaker', label: 'viva-voz', icon: 'speaker' },
		{ id: 'add-call', label: 'adicionar', icon: 'add-call' },
		{ id: 'facetime', label: 'FaceTime', icon: 'facetime' },
		{ id: 'contacts', label: 'contatos', icon: 'contacts' }
	] as const;

	let elapsedSeconds = $state(0);
	let callAudio: HTMLAudioElement | undefined;
	let hasNavigated = false;

	function stopCallAudio() {
		if (!callAudio) return;
		callAudio.pause();
		callAudio.currentTime = 0;
	}

	function goToStory() {
		if (hasNavigated) return;
		hasNavigated = true;
		stopCallAudio();
		goto('/historia');
	}

	function handleHangUp() {
		playClick();
		goToStory();
	}

	function formatTimer(totalSeconds: number) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	onMount(() => {
		callAudio = new Audio(CALL_AUDIO_SRC);
		callAudio.addEventListener('ended', goToStory);

		const playCallAudio = () => {
			callAudio?.play().catch(() => {
				const resume = () => {
					callAudio?.play().catch(() => {});
				};
				window.addEventListener('pointerdown', resume, { once: true });
				window.addEventListener('keydown', resume, { once: true });
			});
		};

		playCallAudio();

		const intervalId = setInterval(() => {
			elapsedSeconds += 1;
		}, 1000);

		return () => {
			clearInterval(intervalId);
			callAudio?.removeEventListener('ended', goToStory);
			stopCallAudio();
			callAudio = undefined;
		};
	});
</script>

<main class="call-screen call-active" aria-label="Chamada em andamento">
	<div class="call-screen__backdrop" aria-hidden="true">
		<img class="call-screen__backdrop-image" src="/images/call-bg.png" alt="" />
		<div class="call-screen__backdrop-overlay"></div>
	</div>

	<div class="call-active__content">
		<header class="call-active__header">
			<img
				class="call-active__avatar"
				src="/images/call-avatar.png"
				alt=""
				width="44"
				height="44"
			/>
			<div class="call-active__info">
				<p class="call-active__timer" aria-live="polite">{formatTimer(elapsedSeconds)}</p>
				<p class="call-active__name">Número Desconhecido</p>
			</div>
		</header>

		<section class="call-active__controls-wrap" aria-label="Controles da chamada">
			<div class="call-active__controls">
				{#each controls as control (control.id)}
					<button type="button" class="call-active__control">
						<span class="call-active__control-btn" aria-hidden="true">
							{#if control.icon === 'mute'}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									<path
										d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
										fill="currentColor"
									/>
									<path
										d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
										fill="currentColor"
									/>
									<path
										d="M3 3l18 18"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
									/>
								</svg>
							{:else if control.icon === 'keypad'}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									{#each Array(9) as _, i}
										<circle
											cx={(i % 3) * 7 + 5}
											cy={Math.floor(i / 3) * 7 + 5}
											r="1.35"
											fill="currentColor"
										/>
									{/each}
								</svg>
							{:else if control.icon === 'speaker'}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									<path
										d="M3 10v4h4l5 5V5L7 10H3zm11.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z"
										fill="currentColor"
									/>
									<path
										d="M14.5 3.23v2.06c2.89 1 5 3.77 5 6.71s-2.11 5.71-5 6.71v2.06c4.01-1.11 7-4.86 7-8.77s-2.99-7.66-7-8.77z"
										fill="currentColor"
									/>
								</svg>
							{:else if control.icon === 'add-call'}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									<path
										d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
										fill="currentColor"
									/>
								</svg>
							{:else if control.icon === 'facetime'}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									<path
										d="M17 10.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"
										fill="currentColor"
									/>
									<text x="9" y="14" fill="currentColor" font-size="7" font-weight="700">?</text>
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" class="call-active__control-icon">
									<path
										d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
										fill="currentColor"
									/>
								</svg>
							{/if}
						</span>
						<span class="call-active__control-label">{control.label}</span>
					</button>
				{/each}
			</div>
		</section>

		<footer class="call-active__footer">
			<button
				type="button"
				class="call-screen__action call-screen__action--decline"
				aria-label="Encerrar chamada"
				onclick={handleHangUp}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" class="call-screen__action-icon">
					<path
						d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
						fill="currentColor"
					/>
				</svg>
			</button>
		</footer>
	</div>
</main>
