<script lang="ts">
	import { advanceTo } from '$lib/navigation';
	import StoryScreen from '$lib/components/StoryScreen.svelte';
	import { getPandaHeadLinks, PANDA_VD004 } from '$lib/constants/panda';
	import { STORY_COUNT } from '$lib/constants/story';

	const panda = PANDA_VD004;
	const headLinks = getPandaHeadLinks(panda);

	function handleEnded() {
		advanceTo('/documento', 'video_end');
	}
</script>

<svelte:head>
	<link rel="preload" href="https://player.pandavideo.com.br/api.v2.js" as="script" />
	{#each headLinks as link (link.href + link.rel)}
		{#if link.as}
			<link rel={link.rel} href={link.href} as={link.as} />
		{:else}
			<link rel={link.rel} href={link.href} />
		{/if}
	{/each}
</svelte:head>

<StoryScreen
	embedSrc={panda.embedSrc}
	pandaIframeId={panda.iframeId}
	pandaHlsUrl={panda.hlsUrl}
	segmentDurationSec={panda.durationSec}
	activeStoryIndex={3}
	storyCount={STORY_COUNT}
	onEnded={handleEnded}
	ariaLabel="Story Detective Night — parte 4"
/>
