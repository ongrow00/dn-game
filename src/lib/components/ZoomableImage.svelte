<script lang="ts">
	interface Props {
		src: string;
		alt: string;
	}

	let { src, alt }: Props = $props();

	const MIN_SCALE = 1;
	const MAX_SCALE = 4;
	const DOUBLE_TAP_MS = 300;
	const DOUBLE_TAP_SCALE = 2.5;

	let viewportEl = $state<HTMLDivElement | null>(null);
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);

	const pointers = new Map<number, { x: number; y: number }>();
	let pinchStartDistance = 0;
	let pinchStartScale = 1;
	let panPointerId: number | null = null;
	let panStart = { x: 0, y: 0, translateX: 0, translateY: 0 };
	let lastTapAt = 0;
	let didPan = false;

	function clampTranslation(nextScale = scale) {
		if (!viewportEl || nextScale <= 1) {
			translateX = 0;
			translateY = 0;
			return;
		}

		const { width, height } = viewportEl.getBoundingClientRect();
		const maxX = ((nextScale - 1) * width) / 2;
		const maxY = ((nextScale - 1) * height) / 2;
		translateX = Math.min(maxX, Math.max(-maxX, translateX));
		translateY = Math.min(maxY, Math.max(-maxY, translateY));
	}

	function setScale(nextScale: number) {
		scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
		if (scale <= 1) {
			scale = 1;
			translateX = 0;
			translateY = 0;
			return;
		}
		clampTranslation(scale);
	}

	function pointerDistance(): number {
		const pts = [...pointers.values()];
		if (pts.length < 2) return 0;
		const dx = pts[1].x - pts[0].x;
		const dy = pts[1].y - pts[0].y;
		return Math.hypot(dx, dy);
	}

	function resetZoom() {
		scale = 1;
		translateX = 0;
		translateY = 0;
	}

	function toggleDoubleTapZoom(clientX: number, clientY: number) {
		if (!viewportEl) return;

		if (scale > 1) {
			resetZoom();
			return;
		}

		const rect = viewportEl.getBoundingClientRect();
		const originX = clientX - rect.left - rect.width / 2;
		const originY = clientY - rect.top - rect.height / 2;
		const nextScale = DOUBLE_TAP_SCALE;

		translateX = -originX * (nextScale - 1);
		translateY = -originY * (nextScale - 1);
		setScale(nextScale);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;

		viewportEl?.setPointerCapture(event.pointerId);
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (pointers.size === 2) {
			panPointerId = null;
			pinchStartDistance = pointerDistance();
			pinchStartScale = scale;
			return;
		}

		if (pointers.size === 1 && scale > 1) {
			panPointerId = event.pointerId;
			panStart = {
				x: event.clientX,
				y: event.clientY,
				translateX,
				translateY
			};
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (!pointers.has(event.pointerId)) return;

		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (pointers.size >= 2 && pinchStartDistance > 0) {
			const distance = pointerDistance();
			setScale(pinchStartScale * (distance / pinchStartDistance));
			return;
		}

		if (panPointerId === event.pointerId && scale > 1) {
			const dx = event.clientX - panStart.x;
			const dy = event.clientY - panStart.y;
			if (Math.hypot(dx, dy) > 8) didPan = true;
			translateX = panStart.translateX + dx;
			translateY = panStart.translateY + dy;
			clampTranslation();
		}
	}

	function onPointerUp(event: PointerEvent) {
		pointers.delete(event.pointerId);
		viewportEl?.releasePointerCapture(event.pointerId);

		if (panPointerId === event.pointerId) {
			panPointerId = null;
		}

		if (pointers.size < 2) {
			pinchStartDistance = 0;
		}

		if (pointers.size === 0 && scale <= 1.02) {
			resetZoom();
		}
	}

	function onPointerCancel(event: PointerEvent) {
		onPointerUp(event);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		if (!viewportEl) return;
		const rect = viewportEl.getBoundingClientRect();
		toggleDoubleTapZoom(rect.left + rect.width / 2, rect.top + rect.height / 2);
	}

	function onClick(event: MouseEvent) {
		if (didPan) {
			didPan = false;
			return;
		}

		const now = Date.now();
		if (now - lastTapAt < DOUBLE_TAP_MS) {
			event.preventDefault();
			toggleDoubleTapZoom(event.clientX, event.clientY);
			lastTapAt = 0;
			return;
		}
		lastTapAt = now;
	}

	function onWheel(event: WheelEvent) {
		event.preventDefault();
		if (!viewportEl) return;

		const delta = event.deltaY > 0 ? -0.12 : 0.12;
		const rect = viewportEl.getBoundingClientRect();
		const originX = event.clientX - rect.left - rect.width / 2;
		const originY = event.clientY - rect.top - rect.height / 2;
		const nextScale = scale + delta * scale;

		if (nextScale <= 1) {
			resetZoom();
			return;
		}

		const ratio = nextScale / scale;
		translateX = translateX * ratio - originX * (ratio - 1);
		translateY = translateY * ratio - originY * (ratio - 1);
		setScale(nextScale);
	}
</script>

<div
	class="zoomable-image"
	bind:this={viewportEl}
	tabindex="0"
	role="button"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerCancel}
	onclick={onClick}
	onkeydown={onKeydown}
	onwheel={onWheel}
	aria-label={`${alt}. Pinça, roda do mouse ou duplo toque para ampliar.`}
>
	<img
		class="zoomable-image__img"
		{src}
		{alt}
		draggable="false"
		style:transform="translate({translateX}px, {translateY}px) scale({scale})"
	/>
</div>
