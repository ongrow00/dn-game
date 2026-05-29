<script lang="ts">
	import { advanceTo } from '$lib/navigation';
	import { playClick } from '$lib/sfx';

	interface Suspect {
		id: number;
		src: string;
		name: string;
	}

	const suspects: Suspect[] = [
		{ id: 1, src: '/images/suspect-1.png', name: 'Suspeita 1' },
		{ id: 2, src: '/images/suspect-2.png', name: 'Suspeito 2' },
		{ id: 3, src: '/images/suspect-3.png', name: 'Suspeito 3' },
		{ id: 4, src: '/images/suspect-4.png', name: 'Suspeito 4' }
	];

	let selected = $state<number | null>(null);

	function handleSelect(id: number) {
		selected = id;
		playClick();
		navigator.vibrate?.(30);
		setTimeout(() => {
			advanceTo('/chamada-2', 'interaction');
		}, 600);
	}
</script>

<main class="lineup-screen">
	<header class="lineup-screen__header">
		<h1 class="lineup-screen__title">
			A polícia acredita que <strong>um deles está envolvido</strong> nos crimes.
		</h1>
		<p class="lineup-screen__subtitle">
			Analise os rostos, observe os detalhes e escolha quem você acredita ser o principal suspeito da investigação.
		</p>
	</header>

	<div class="lineup-screen__grid">
		{#each suspects as suspect (suspect.id)}
			<button
				type="button"
				class="lineup-screen__card"
				class:lineup-screen__card--selected={selected === suspect.id}
				class:lineup-screen__card--dimmed={selected !== null && selected !== suspect.id}
				onclick={() => handleSelect(suspect.id)}
				disabled={selected !== null}
				aria-label={suspect.name}
			>
				<img src={suspect.src} alt={suspect.name} draggable="false" />
			</button>
		{/each}
	</div>
</main>
