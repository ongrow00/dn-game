<script lang="ts">
	import './layout.css';

	const SITE_TITLE = 'João Picadinho - Detective Night';

	let { children } = $props();
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<meta name="description" content="João Picadinho — Operação Fragmento" />
</svelte:head>

<div class="app-shell">
	{@render children()}
</div>
