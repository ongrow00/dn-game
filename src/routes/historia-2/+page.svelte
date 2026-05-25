<script lang="ts">
	import { goto } from '$app/navigation';
	import StoryScreen from '$lib/components/StoryScreen.svelte';
	import { STORY_COUNT } from '$lib/constants/story';

	const VIDEO_SRC = '/JP/VD02.mov';

	function handleEnded() {
		goto('/enigma');
	}
</script>

<StoryScreen
	videoSrc={VIDEO_SRC}
	activeStoryIndex={1}
	storyCount={STORY_COUNT}
	onEnded={handleEnded}
	ariaLabel="Story Detective Night — parte 2"
/>
