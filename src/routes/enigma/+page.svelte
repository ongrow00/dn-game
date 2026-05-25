<script lang="ts">
	import { goto } from '$app/navigation';
	import { playClick } from '$lib/sfx';

	const options = [
		'Alguém está copiando os crimes',
		'A polícia escondeu algo',
		'Claudemir nunca trabalhou sozinho',
		'O verdadeiro caso nunca terminou'
	] as const;

	function handleAdvance() {
		goto('/quadro');
	}

	function handleSelect(_option: (typeof options)[number]) {
		playClick();
		handleAdvance();
	}

	function handleSkip() {
		playClick();
		handleAdvance();
	}
</script>

<main class="quiz-screen" aria-labelledby="enigma-question">
	<header class="quiz-screen__header">
		<h1 id="enigma-question" class="quiz-screen__question">
			Se <strong>Claudemir</strong> está preso <strong>desde 2013...</strong> então o que
			<strong>realmente está acontecendo?</strong>
		</h1>
	</header>

	<section class="quiz-screen__options" aria-label="Opções de resposta">
		{#each options as option (option)}
			<button type="button" class="quiz-screen__option" onclick={() => handleSelect(option)}>
				{option}
			</button>
		{/each}
	</section>

	<footer class="quiz-screen__footer">
		<button type="button" class="quiz-screen__skip" onclick={handleSkip}>Pular Enigma</button>
	</footer>
</main>
