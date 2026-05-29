<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import './layout.css';
	import { trackFunnelAdvance, trackFunnelStepView, trackPageView } from '$lib/analytics';
	import { captureFromUrl, saveUtms } from '$lib/utm';

	const SITE_TITLE = 'João Picadinho - Detective Night';

	let { children } = $props();

	onMount(() => {
		const utms = captureFromUrl(page.url.searchParams);
		saveUtms(utms);
	});

	afterNavigate((navigation) => {
		const pagePath = page.url.pathname + page.url.search;
		trackPageView(pagePath, SITE_TITLE);
		trackFunnelStepView(page.url.pathname);

		const fromPath = navigation.from?.url.pathname;
		const toPath = navigation.to?.url.pathname;

		if (fromPath && toPath && fromPath !== toPath) {
			trackFunnelAdvance(fromPath, toPath);
		}
	});
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
