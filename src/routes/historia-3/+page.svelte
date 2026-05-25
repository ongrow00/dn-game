<script lang="ts">
	import StoryScreen from '$lib/components/StoryScreen.svelte';
	import { STORY_COUNT } from '$lib/constants/story';

	const VIDEO_SRC = '/JP/VD03.mov';

	import { goto } from '$app/navigation';

	function handleEnded() {
		goto('/senha');
	}
</script>

<StoryScreen
	videoSrc={VIDEO_SRC}
	activeStoryIndex={2}
	storyCount={STORY_COUNT}
	onEnded={handleEnded}
	ariaLabel="Story Detective Night — parte 3"
/>
