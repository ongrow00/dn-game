<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { playClick, startRingVibration, stopRingVibration } from '$lib/sfx';

	const RINGTONE_SRC = '/JP/cell-phone-vibrate.mp3';

	let ringtone: HTMLAudioElement | undefined;

	function stopRingtone() {
		if (!ringtone) return;
		ringtone.pause();
		ringtone.currentTime = 0;
	}

	function handleAccept() {
		playClick();
		stopRingtone();
		stopRingVibration();
		goto('/chamada/ativa');
	}

	onMount(() => {
		ringtone = new Audio(RINGTONE_SRC);
		ringtone.loop = true;

		const playRingtone = () => {
			ringtone?.play().catch(() => {
				const resume = () => {
					ringtone?.play().catch(() => {});
					startRingVibration();
				};
				window.addEventListener('pointerdown', resume, { once: true });
				window.addEventListener('keydown', resume, { once: true });
			});
		};

		playRingtone();
		startRingVibration();

		return () => {
			stopRingtone();
			stopRingVibration();
			ringtone = undefined;
		};
	});
</script>

<main class="call-screen" aria-label="Chamada recebida">
	<div class="call-screen__backdrop" aria-hidden="true">
		<img class="call-screen__backdrop-image" src="/images/call-bg.png" alt="" />
		<div class="call-screen__backdrop-overlay"></div>
	</div>

	<div class="call-screen__content">
		<section class="call-screen__caller" aria-labelledby="call-caller-name">
			<img
				class="call-screen__avatar"
				src="/images/call-avatar.png"
				alt=""
				width="120"
				height="120"
			/>
			<h1 id="call-caller-name" class="call-screen__name">Número Desconhecido</h1>
			<p class="call-screen__status">Está te ligando</p>
		</section>

		<footer class="call-screen__actions" aria-label="Ações da chamada">
			<button
				type="button"
				class="call-screen__action call-screen__action--decline"
				aria-label="Recusar chamada"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" class="call-screen__action-icon">
					<path
						d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
						fill="currentColor"
					/>
				</svg>
			</button>

			<div class="call-screen__accept-wrap">
				<span class="call-screen__ripple" aria-hidden="true"></span>
				<span class="call-screen__ripple call-screen__ripple--delay" aria-hidden="true"></span>
				<button
					type="button"
					class="call-screen__action call-screen__action--accept"
					aria-label="Atender chamada"
					onclick={handleAccept}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" class="call-screen__action-icon">
						<path
							d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
							fill="currentColor"
						/>
					</svg>
				</button>
			</div>
		</footer>
	</div>
</main>
