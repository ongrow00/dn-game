<script lang="ts">
	import type { Snippet } from 'svelte';
	import { playClick } from '$lib/sfx';

	interface Props {
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		playClick();
		onclick?.(e);
	}
</script>

<button {type} {disabled} class="btn-primary {className}" onclick={handleClick}>
	{@render children()}
</button>
