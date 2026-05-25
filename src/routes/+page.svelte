<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import BrandLogo from '$lib/components/BrandLogo.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const MIN_REMAINING_ACCESS = 2;
	const ACCESS_COUNTDOWN_MS = 10_000;

	let remainingAccess = $state(5);

	onMount(() => {
		const intervalId = setInterval(() => {
			if (remainingAccess > MIN_REMAINING_ACCESS) {
				remainingAccess -= 1;
			} else {
				clearInterval(intervalId);
			}
		}, ACCESS_COUNTDOWN_MS);

		return () => clearInterval(intervalId);
	});
</script>

<main class="page-main page-main--spread">
	<header class="page-header">
		<BrandLogo />
	</header>

	<section class="page-body" aria-labelledby="hero-heading">
		<div class="hero-stack">
			<p class="text-lead">Você foi selecionado para a Operação Fragmento.</p>
		<h1 id="hero-heading" class="heading-hero">
			<span class="text-accent">Só 1,96%</span>
			<span> das pessoas chegam até o </span>
			<span class="text-accent">verdadeiro culpado.</span>
			<span> Você é capaz?</span>
		</h1>
		</div>
	</section>

	<footer class="page-footer">
		<p class="text-caption" aria-live="polite">
			Restam apenas <strong>{remainingAccess} acessos gratuitos</strong>.
		</p>
		<Button onclick={() => goto('/instrucoes')}>ACEITAR MISSÃO</Button>
	</footer>
</main>
