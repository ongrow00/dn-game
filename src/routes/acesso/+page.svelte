<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const messages = [
		'Verificando sua identidade.',
		'Liberando arquivos confidenciais.',
		'Acesso autorizado.'
	];

	let currentIndex = $state(-1);

	onMount(() => {
		setTimeout(() => (currentIndex = 0), 800);
		setTimeout(() => (currentIndex = 1), 2800);
		setTimeout(() => (currentIndex = 2), 4800);
		setTimeout(() => {
			goto('/arquivos');
		}, 8800);
	});
</script>

<main class="loading-screen">
	<div class="loading-screen__messages">
		{#each messages as msg, i}
			{#if i <= currentIndex}
				<p
					class="loading-screen__text"
					class:loading-screen__text--visible={i <= currentIndex}
					class:loading-screen__text--past={i < currentIndex}
				>
					{msg}
				</p>
			{/if}
		{/each}
	</div>
</main>
