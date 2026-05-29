<script lang="ts">
	import { advanceTo } from '$lib/navigation';
	import { playClick } from '$lib/sfx';

	const options = [
		'Uma nova vítima foi encontrada',
		'Claudemir confessou novos crimes',
		'A polícia encontrou a arma',
		'Uma testemunha desapareceu'
	] as const;

	function goToScene() {
		advanceTo('/cena', 'interaction');
	}

	function handleSelect(_option: (typeof options)[number]) {
		playClick();
		goToScene();
	}

	function handleSkip() {
		playClick();
		advanceTo('/cena', 'quiz_skip');
	}
</script>

<main class="quiz-screen" aria-labelledby="quiz-question">
	<header class="quiz-screen__header">
		<h1 id="quiz-question" class="quiz-screen__question">
			O que fez a polícia reabrir o caso <strong>João Picadinho</strong>?
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
		<button type="button" class="quiz-screen__skip" onclick={handleSkip}>Pular pergunta</button>
	</footer>
</main>
