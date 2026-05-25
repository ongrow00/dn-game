<script lang="ts">
	import { onMount } from 'svelte';

	let show = $state(false);

	onMount(() => {
		setTimeout(() => (show = true), 300);
	});
</script>

<main class="buy-screen">
	<header class="buy-screen__header" class:buy-screen__header--visible={show}>
		<img class="buy-screen__logo" src="/images/logo-dark.png" alt="Detective Night" />

		<h1 class="buy-screen__title">
			Receba os arquivos do caso João Picadinho na sua casa nos próximos dias para você investigar
		</h1>

		<p class="buy-screen__subtitle">
			Dentro do pacote confidencial você encontrará documentos, fotos, relatórios e pistas reais para desvendar o caso completo.
		</p>
	</header>

	<div class="buy-screen__image" class:buy-screen__image--visible={show}>
		<img src="/images/product-box.png" alt="Pacote Detective Night — João Picadinho" />
	</div>
</main>
