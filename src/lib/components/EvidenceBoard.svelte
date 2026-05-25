<script lang="ts">
	import { onDestroy } from 'svelte';

	type ClueId = 'body' | 'knife' | 'mugshot' | 'trash';

	type LineSegment = {
		key: string;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	};

	type Clue = {
		id: ClueId;
		src: string;
		alt: string;
	};

	const clues: Clue[] = [
		{
			id: 'body',
			src: '/images/quadro/evidence-body.png',
			alt: 'Diagrama corporal com marcações forenses'
		},
		{
			id: 'knife',
			src: '/images/quadro/evidence-knife.png',
			alt: 'Faca com manchas de sangue ao lado de régua de medição'
		},
		{
			id: 'mugshot',
			src: '/images/quadro/evidence-mugshot.png',
			alt: 'Fotografia tipo fichamento de suspeito'
		},
		{
			id: 'trash',
			src: '/images/quadro/evidence-trash.png',
			alt: 'Sacos de lixo em calçada à noite'
		}
	];

	interface Props {
		hasConnection?: boolean;
	}

	let { hasConnection = $bindable(false) }: Props = $props();

	let boardEl = $state<HTMLDivElement | null>(null);
	let svgSize = $state({ w: 1, h: 1 });
	const pinEls: Partial<Record<ClueId, HTMLButtonElement>> = {};

	let connections = $state<Array<[ClueId, ClueId]>>([]);
	let activeFrom = $state<ClueId | null>(null);
	let dragPoint = $state<{ x: number; y: number } | null>(null);
	let lines = $state<LineSegment[]>([]);

	let dragPointerId = $state<number | null>(null);

	function connectionKey(a: ClueId, b: ClueId): string {
		return [a, b].sort().join('-');
	}

	function isConnected(a: ClueId, b: ClueId): boolean {
		return connections.some(([x, y]) => connectionKey(x, y) === connectionKey(a, b));
	}

	function syncSvgSize() {
		if (!boardEl) return;
		const { width, height } = boardEl.getBoundingClientRect();
		if (width > 0 && height > 0) {
			svgSize = { w: width, h: height };
		}
	}

	function getBoardRect() {
		return boardEl?.getBoundingClientRect() ?? null;
	}

	function toBoardPoint(clientX: number, clientY: number): { x: number; y: number } | null {
		const boardRect = getBoardRect();
		if (!boardRect || boardRect.width <= 0 || boardRect.height <= 0) return null;
		return {
			x: clientX - boardRect.left,
			y: clientY - boardRect.top
		};
	}

	function getPinCenter(id: ClueId): { x: number; y: number } | null {
		const pin = pinEls[id];
		const boardRect = getBoardRect();
		if (!pin || !boardRect) return null;
		const rect = pin.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2 - boardRect.left,
			y: rect.top + rect.height / 2 - boardRect.top
		};
	}

	function updateLines() {
		syncSvgSize();
		const segments: LineSegment[] = [];

		for (const [from, to] of connections) {
			const a = getPinCenter(from);
			const b = getPinCenter(to);
			if (a && b) {
				segments.push({
					key: connectionKey(from, to),
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y
				});
			}
		}

		if (activeFrom && dragPoint) {
			const from = getPinCenter(activeFrom);
			if (from) {
				segments.push({
					key: 'drag',
					x1: from.x,
					y1: from.y,
					x2: dragPoint.x,
					y2: dragPoint.y
				});
			}
		}

		lines = segments;
	}

	function findPinAtPoint(clientX: number, clientY: number): ClueId | null {
		const hits = document.elementsFromPoint(clientX, clientY);
		for (const el of hits) {
			const pin = el.closest<HTMLElement>('[data-pin-id]');
			if (!pin) continue;
			const id = pin.dataset.pinId as ClueId | undefined;
			if (id && clues.some((c) => c.id === id)) return id;
		}
		return null;
	}

	function connectPins(from: ClueId, to: ClueId) {
		if (from === to || isConnected(from, to)) return;
		connections = [...connections, [from, to]];
		hasConnection = connections.length > 0;
		// $effect reacts to connections change and calls updateLines
	}

	function stopDrag() {
		window.removeEventListener('pointermove', onWindowPointerMove);
		window.removeEventListener('pointerup', onWindowPointerUp);
		window.removeEventListener('pointercancel', onWindowPointerCancel);
		dragPointerId = null;
		activeFrom = null;
		dragPoint = null;
		// $effect reacts to activeFrom change and calls updateLines
	}

	function onWindowPointerMove(event: PointerEvent) {
		if (event.pointerId !== dragPointerId || !activeFrom) return;
		dragPoint = toBoardPoint(event.clientX, event.clientY);
		// Called directly (not via effect) to keep drag line smooth
		updateLines();
	}

	function onWindowPointerCancel(event: PointerEvent) {
		// pointercancel (palm rejection, incoming call) must never create a connection
		if (event.pointerId !== dragPointerId) return;
		stopDrag();
	}

	function onWindowPointerUp(event: PointerEvent) {
		if (event.pointerId !== dragPointerId || !activeFrom) {
			stopDrag();
			return;
		}

		const from = activeFrom;
		const targetId = findPinAtPoint(event.clientX, event.clientY);

		stopDrag();

		if (targetId) {
			connectPins(from, targetId);
		}
	}

	function startDrag(id: ClueId, event: PointerEvent) {
		event.preventDefault();

		stopDrag();
		syncSvgSize();

		activeFrom = id;
		dragPoint = toBoardPoint(event.clientX, event.clientY);
		dragPointerId = event.pointerId;

		updateLines();

		window.addEventListener('pointermove', onWindowPointerMove);
		window.addEventListener('pointerup', onWindowPointerUp);
		window.addEventListener('pointercancel', onWindowPointerCancel);
	}

	onDestroy(() => stopDrag());

	function handlePinPointerDown(id: ClueId, event: PointerEvent) {
		// Segundo toque em outro pin: conecta direto (sem depender do arraste)
		if (activeFrom && activeFrom !== id) {
			event.preventDefault();
			connectPins(activeFrom, id);
			stopDrag();
			return;
		}

		startDrag(id, event);
	}

	function pinRef(node: HTMLButtonElement, id: ClueId) {
		pinEls[id] = node;
		return {
			destroy() {
				delete pinEls[id];
			}
		};
	}

	$effect(() => {
		void connections;
		void activeFrom;
		// dragPoint is not tracked here — onWindowPointerMove calls updateLines directly,
		// avoiding a double call on every pointermove event.
		updateLines();
	});

	$effect(() => {
		if (!boardEl) return;
		syncSvgSize();
		const observer = new ResizeObserver(() => updateLines());
		observer.observe(boardEl);
		return () => observer.disconnect();
	});
</script>

<div
	class="evidence-board"
	role="application"
	aria-label="Quadro de evidências — conecte as pistas arrastando entre os círculos vermelhos"
	bind:this={boardEl}
>
	<svg
		class="evidence-board__lines"
		width={svgSize.w}
		height={svgSize.h}
		viewBox="0 0 {svgSize.w} {svgSize.h}"
		aria-hidden="true"
	>
		{#each lines as line (line.key)}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="#c41e1c"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
		{/each}
	</svg>

	<div class="evidence-board__grid">
		{#each clues as clue (clue.id)}
			<article class="evidence-board__card">
				<img
					class="evidence-board__photo"
					src={clue.src}
					alt={clue.alt}
					draggable="false"
					onload={() => requestAnimationFrame(updateLines)}
				/>
				<button
					type="button"
					class="evidence-board__pin"
					class:evidence-board__pin--active={activeFrom === clue.id}
					data-pin-id={clue.id}
					aria-label="Ponto de conexão da evidência"
					use:pinRef={clue.id}
					onpointerdown={(e) => handlePinPointerDown(clue.id, e)}
				>
					<span class="evidence-board__pin-ripple" aria-hidden="true"></span>
					<span
						class="evidence-board__pin-ripple evidence-board__pin-ripple--delay"
						aria-hidden="true"
					></span>
					<span class="evidence-board__pin-core" aria-hidden="true"></span>
				</button>
			</article>
		{/each}
	</div>
</div>
