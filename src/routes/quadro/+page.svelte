<script lang="ts">
	import { advanceTo } from '$lib/navigation';
	import { playClick } from '$lib/sfx';
	import Button from '$lib/components/ui/Button.svelte';
	import EvidenceBoard from '$lib/components/EvidenceBoard.svelte';

	let hasConnection = $state(false);

	function goToStory() {
		advanceTo('/historia-3', 'interaction');
	}

	function handleSkip() {
		playClick();
		advanceTo('/historia-3', 'quiz_skip');
	}

	function handleAdvance() {
		goToStory();
	}
</script>

<main class="board-screen" aria-labelledby="board-heading">
	<header class="board-screen__header">
		<h1 id="board-heading" class="board-screen__title">
			Existe uma ligação entre essas evidências.
		</h1>
		<p class="board-screen__hint">
			Clique no circulo vermelho, arraste e conecte as pistas e descubra o que a polícia ignorou.
		</p>
	</header>

	<div class="board-screen__board-wrap">
		<EvidenceBoard bind:hasConnection />
	</div>

	<footer class="board-screen__footer">
		{#if hasConnection}
			<Button class="board-screen__cta" onclick={handleAdvance}>AVANÇAR</Button>
		{:else}
			<button type="button" class="quiz-screen__skip" onclick={handleSkip}>Pular Enigma</button>
		{/if}
	</footer>
</main>
