<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { trackReceiveFilesClick } from '$lib/analytics';
	import { appendUtmsToUrl, loadUtms } from '$lib/utm';

	const ARCHIVES_URL = 'https://detectivenight.com/pages/arquivos-joao-picadinho';

	let showContent = $state(false);

	function handleReceiveFiles() {
		const url = appendUtmsToUrl(ARCHIVES_URL, loadUtms());
		trackReceiveFilesClick(url);
		window.location.href = url;
	}

	onMount(() => {
		setTimeout(() => (showContent = true), 400);
	});
</script>

<main class="files-screen">
	<header class="files-screen__header" class:files-screen__header--visible={showContent}>
		<h1 class="files-screen__title">
			<strong>Você foi aprovado</strong> para receber os <strong>arquivos físicos</strong> da operação.
		</h1>
		<p class="files-screen__subtitle">
			Receba em casa todos os arquivos do caso e continue a investigação com as provas originais e descubra o verdadeiro culpado.
		</p>
	</header>

	<div class="files-screen__image" class:files-screen__image--visible={showContent}>
		<img src="/images/case-files.png" alt="Arquivos do caso" />
	</div>

	<footer class="files-screen__footer" class:files-screen__footer--visible={showContent}>
		<Button onclick={handleReceiveFiles}>RECEBER ARQUIVOS</Button>
	</footer>
</main>
