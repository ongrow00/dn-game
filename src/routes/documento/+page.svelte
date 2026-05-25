<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { playClick } from '$lib/sfx';

	interface Fragment {
		id: number;
		src: string;
		slot: number | null;
		x: number;
		y: number;
		rotation: number;
	}

	const CORRECT_ORDER = [1, 2, 3, 4];

	const initialScatter: { x: number; y: number; rot: number }[] = [
		{ x: 15, y: 20, rot: -6 },
		{ x: 55, y: 10, rot: 4 },
		{ x: 10, y: 55, rot: 3 },
		{ x: 50, y: 50, rot: -5 }
	];

	let fragments = $state<Fragment[]>([
		{ id: 1, src: '/images/fragment-1.png', slot: null, x: 0, y: 0, rotation: 0 },
		{ id: 2, src: '/images/fragment-2.png', slot: null, x: 0, y: 0, rotation: 0 },
		{ id: 3, src: '/images/fragment-3.png', slot: null, x: 0, y: 0, rotation: 0 },
		{ id: 4, src: '/images/fragment-4.png', slot: null, x: 0, y: 0, rotation: 0 }
	]);

	let solved = $state(false);
	let dragging = $state<number | null>(null);
	let dragOffset = { x: 0, y: 0 };
	let containerEl: HTMLDivElement | undefined = $state();
	let slotEls: (HTMLDivElement | null)[] = $state([null, null, null, null]);

	onMount(() => {
		const shuffled = [...fragments];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		fragments = shuffled.map((f, i) => ({
			...f,
			x: initialScatter[i].x,
			y: initialScatter[i].y,
			rotation: initialScatter[i].rot
		}));
	});

	function getPointerPos(e: PointerEvent) {
		if (!containerEl) return { x: 0, y: 0 };
		const rect = containerEl.getBoundingClientRect();
		return {
			x: ((e.clientX - rect.left) / rect.width) * 100,
			y: ((e.clientY - rect.top) / rect.height) * 100
		};
	}

	function snapToSlot(frag: Fragment, slotIndex: number) {
		const el = slotEls[slotIndex];
		if (!el || !containerEl) return;
		const slotRect = el.getBoundingClientRect();
		const containerRect = containerEl.getBoundingClientRect();
		// Position piece top-left at slot top-left (piece width ~38% ≈ slot width)
		frag.x = ((slotRect.left - containerRect.left) / containerRect.width) * 100;
		frag.y = ((slotRect.top - containerRect.top) / containerRect.height) * 100;
		frag.rotation = 0;
	}

	function handlePointerDown(e: PointerEvent, fragmentId: number) {
		if (solved) return;
		e.preventDefault();
		playClick();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

		const frag = fragments.find(f => f.id === fragmentId)!;
		frag.slot = null;

		const pos = getPointerPos(e);
		dragOffset = { x: pos.x - frag.x, y: pos.y - frag.y };
		dragging = fragmentId;

		// Single assignment: moves element in DOM instead of destroying+recreating it,
		// preserving the pointer capture set above.
		const rest = fragments.filter(f => f.id !== fragmentId);
		fragments = [...rest, { ...frag, slot: null, rotation: frag.rotation }];
	}

	function handlePointerMove(e: PointerEvent) {
		if (dragging === null) return;
		e.preventDefault();
		const pos = getPointerPos(e);
		const frag = fragments.find(f => f.id === dragging)!;
		frag.x = pos.x - dragOffset.x;
		frag.y = pos.y - dragOffset.y;
	}

	function handlePointerUp(e: PointerEvent) {
		if (dragging === null) return;
		const frag = fragments.find(f => f.id === dragging)!;

		const slotIndex = getSlotFromPosition(e);
		if (slotIndex !== null) {
			playClick();
			const occupant = fragments.find(f => f.slot === slotIndex && f.id !== frag.id);
			if (occupant) {
				occupant.slot = null;
				occupant.x = frag.x;
				occupant.y = frag.y;
				occupant.rotation = (Math.random() - 0.5) * 10;
			}
			frag.slot = slotIndex;
			snapToSlot(frag, slotIndex);
		} else {
			frag.slot = null;
		}

		dragging = null;
		checkSolved();
	}

	function getSlotFromPosition(e: PointerEvent): number | null {
		if (!containerEl) return null;

		for (let i = 0; i < 4; i++) {
			const el = slotEls[i];
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				return i;
			}
		}
		return null;
	}

	function checkSolved() {
		const allPlaced = fragments.every(f => f.slot !== null);
		if (!allPlaced) return;

		const correct = CORRECT_ORDER.every((expectedId, slotIndex) => {
			const frag = fragments.find(f => f.slot === slotIndex);
			return frag?.id === expectedId;
		});

		if (correct) {
			solved = true;
			navigator.vibrate?.([50, 30, 50]);
		} else {
			navigator.vibrate?.([80, 60, 80]);
		}
	}

	function handleSkip() {
		playClick();
		goto('/suspeitos');
	}
</script>

<main class="puzzle-screen">
	<header class="puzzle-screen__header">
		<h1 class="puzzle-screen__title">
			Reconstrua o documento antes que as peças desapareçam.
		</h1>
		<p class="puzzle-screen__subtitle">
			Organize os fragmentos da carta e descubra a mensagem que alguém tentou esconder da investigação.
		</p>
	</header>

	<div
		class="puzzle-screen__area"
		bind:this={containerEl}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
	>
		<div class="puzzle-screen__grid">
			{#each [0, 1, 2, 3] as slotIdx}
				<div
					class="puzzle-screen__slot"
					bind:this={slotEls[slotIdx]}
				></div>
			{/each}
		</div>

		{#each fragments as frag (frag.id)}
			<div
				class="puzzle-screen__piece"
				class:puzzle-screen__piece--dragging={dragging === frag.id}
				class:puzzle-screen__piece--placed={frag.slot !== null && dragging !== frag.id}
				class:puzzle-screen__piece--solved={solved}
				style="left:{frag.x}%;top:{frag.y}%;transform:rotate({frag.rotation}deg){dragging === frag.id ? ' scale(1.08)' : ''}"
				onpointerdown={(e) => handlePointerDown(e, frag.id)}
				role="button"
				tabindex="0"
				aria-label="Fragmento {frag.id}"
			>
				<img src={frag.src} alt="Fragmento {frag.id}" draggable="false" />
			</div>
		{/each}
	</div>

	<footer class="puzzle-screen__footer">
		{#if solved}
			<button type="button" class="puzzle-screen__advance" onclick={() => { playClick(); goto('/suspeitos'); }}>
				AVANÇAR
			</button>
		{:else}
			<button type="button" class="quiz-screen__skip" onclick={handleSkip}>Pular Enigma</button>
		{/if}
	</footer>
</main>
