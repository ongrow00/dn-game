<script lang="ts">
	import { goto } from '$app/navigation';
	import StoryScreen from '$lib/components/StoryScreen.svelte';
	import { STORY_COUNT } from '$lib/constants/story';

	const VIDEO_SRC = '/JP/VD001.mov';

	function handleEnded() {
		goto('/pergunta');
	}
</script>

<StoryScreen
	videoSrc={VIDEO_SRC}
	activeStoryIndex={0}
	storyCount={STORY_COUNT}
	onEnded={handleEnded}
/>
