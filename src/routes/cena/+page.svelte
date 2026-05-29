<script lang="ts">
	import { advanceTo } from '$lib/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import ZoomableImage from '$lib/components/ZoomableImage.svelte';

	const SCENE_PHOTO_SRC = '/images/cena-foto.png';

	function handleAdvance() {
		advanceTo('/historia-2', 'button_click');
	}
</script>

<main class="evidence-screen" aria-labelledby="evidence-heading">
	<header class="evidence-screen__header">
		<h1 id="evidence-heading" class="evidence-screen__title">
			A perícia liberou uma <strong>fotografia da cena.</strong>
		</h1>
		<p class="evidence-screen__hint">
			Você pode dar zoom para analisar os detalhes da imagem.
		</p>
	</header>

	<div class="evidence-screen__viewer" aria-label="Fotografia da cena do crime">
		<ZoomableImage
			src={SCENE_PHOTO_SRC}
			alt="Fotografia noturna de uma estrada com um bilhete manuscrito no chão e placa de Poços de Caldas"
		/>
	</div>

	<footer class="evidence-screen__footer">
		<Button class="evidence-screen__cta" onclick={handleAdvance}>AVANÇAR</Button>
	</footer>
</main>
