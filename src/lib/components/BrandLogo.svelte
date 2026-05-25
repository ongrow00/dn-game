<script lang="ts">
	interface Props {
		alt?: string;
		class?: string;
	}

	let { alt = 'João Picadinho', class: className = '' }: Props = $props();
</script>

<img src="/images/logo.png" {alt} width="124" height="60" class="brand-logo {className}" />
