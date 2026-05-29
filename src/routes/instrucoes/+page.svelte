<script lang="ts">
	import { onMount } from 'svelte';
	import BrandLogo from '$lib/components/BrandLogo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { advanceTo } from '$lib/navigation';

	const ITEM_REVEAL_MS = 1000;

	const instructions = [
		{
			icon: 'fa-solid fa-volume-high',
			title: 'Ative o som do seu celular',
			description: 'O áudio é uma parte essencial da investigação.'
		},
		{
			icon: 'fa-solid fa-eye',
			title: 'Preste atenção em cada detalhe',
			description:
				'As pistas podem aparecer em imagens, sons, textos e comportamentos.'
		},
		{
			icon: 'fa-solid fa-lightbulb',
			title: 'Confie na sua intuição',
			description:
				'Nem tudo será explicado de imediato. Às vezes, o detalhe mais estranho é o mais importante.'
		}
	] as const;

	let visibleCount = $state(0);
	let showButton = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			visibleCount = instructions.length;
			showButton = true;
			return;
		}

		visibleCount = 1;

		const intervalId = setInterval(() => {
			if (visibleCount < instructions.length) {
				visibleCount += 1;
				return;
			}

			showButton = true;
			clearInterval(intervalId);
		}, ITEM_REVEAL_MS);

		return () => clearInterval(intervalId);
	});
</script>

<main class="page-main page-main--spread page-main--instructions">
	<header class="page-header page-header--instructions">
		<BrandLogo />
		<h1 class="heading-instructions">Leia com atenção</h1>
	</header>

	<section class="page-body page-body--instructions" aria-labelledby="instructions-heading">
		<h2 id="instructions-heading" class="visually-hidden">Instruções antes de iniciar</h2>
		<ul class="instruction-list">
			{#each instructions as instruction, index (instruction.title)}
				<li
					class="instruction-item"
					class:instruction-item--visible={index < visibleCount}
					aria-hidden={index >= visibleCount}
				>
					<div class="instruction-icon" aria-hidden="true">
						<i class="{instruction.icon}" aria-hidden="true"></i>
					</div>
					<div class="instruction-content">
						<h3 class="instruction-title">{instruction.title}</h3>
						<p class="instruction-desc">{instruction.description}</p>
					</div>
				</li>
				{#if index < instructions.length - 1}
					<li
						class="instruction-divider"
						class:instruction-divider--visible={index + 1 < visibleCount}
						aria-hidden="true"
					></li>
				{/if}
			{/each}
		</ul>
	</section>

	<footer class="page-footer page-footer--instructions" class:page-footer--cta-visible={showButton}>
		{#if showButton}
			<Button onclick={() => advanceTo('/chamada', 'button_click')}>INICIAR AGORA</Button>
		{/if}
	</footer>
</main>
