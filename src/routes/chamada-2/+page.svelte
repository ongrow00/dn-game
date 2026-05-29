<script lang="ts">
	import { onMount } from 'svelte';
	import { advanceTo } from '$lib/navigation';
	import { playClick, startIncomingRing, stopIncomingRing, unlockIncomingRing } from '$lib/sfx';

	const AVATAR_SRC = '/images/call-avatar-2.png';

	function handleAccept() {
		playClick();
		stopIncomingRing();
		advanceTo('/chamada-2/ativa', 'button_click');
	}

	onMount(() => {
		startIncomingRing();

		return () => {
			stopIncomingRing();
		};
	});
</script>

<main class="call-screen call-screen--facetime" aria-label="FaceTime recebido">
	<div class="facetime__backdrop" aria-hidden="true">
		<img class="facetime__backdrop-image" src={AVATAR_SRC} alt="" />
		<div class="facetime__backdrop-shade"></div>
	</div>

	<div class="facetime__content" onclick={unlockIncomingRing} role="presentation">
		<div class="facetime__preview" aria-hidden="true">
			<img class="facetime__portrait" src={AVATAR_SRC} alt="" />
		</div>

		<section class="facetime__caller" aria-labelledby="facetime-caller-name">
			<p class="facetime__app-label">FaceTime</p>
			<h1 id="facetime-caller-name" class="facetime__name">Detetive Eduardo</h1>
			<p class="facetime__status">vídeo</p>
		</section>

		<footer class="facetime__actions" aria-label="Ações do FaceTime">
			<div class="facetime__action-group">
				<button
					type="button"
					class="facetime__action-btn facetime__action-btn--decline"
					aria-label="Recusar FaceTime"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" class="facetime__action-icon">
						<path
							d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
							fill="currentColor"
						/>
					</svg>
				</button>
				<span class="facetime__action-label">Recusar</span>
			</div>

			<div class="facetime__action-group facetime__action-group--accept">
				<div class="facetime__accept-wrap">
					<span class="facetime__ripple" aria-hidden="true"></span>
					<span class="facetime__ripple facetime__ripple--delay" aria-hidden="true"></span>
					<button
						type="button"
						class="facetime__action-btn facetime__action-btn--accept"
						aria-label="Aceitar FaceTime"
						onclick={handleAccept}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" class="facetime__action-icon">
							<path
								d="M17 10.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"
								fill="currentColor"
							/>
						</svg>
					</button>
				</div>
				<span class="facetime__action-label">Aceitar</span>
			</div>
		</footer>
	</div>
</main>
