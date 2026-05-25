<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { playClick } from '$lib/sfx';

	let showText = $state(false);
	let showPhoto = $state(false);
	let showName = $state(false);
	let showButton = $state(false);

	function timeNow(offsetMinutes: number = 0): string {
		const d = new Date(Date.now() + offsetMinutes * 60_000);
		return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	}

	let timeText = '';
	let timePhoto = '';
	let timeName = '';

	function playNotify() {
		const audio = new Audio('/JP/whatsapp-notify.mp3');
		audio.play().catch(() => {});
		setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 2000);
	}

	onMount(() => {
		timeText = timeNow(-3);
		timePhoto = timeNow(-1);
		timeName = timeNow();

		setTimeout(() => { showText = true; playNotify(); }, 1000);
		setTimeout(() => { showPhoto = true; playNotify(); }, 3000);
		setTimeout(() => { showName = true; playNotify(); }, 5000);
		setTimeout(() => (showButton = true), 6200);
	});

	function advance() {
		playClick();
		goto('/historia-4');
	}
</script>

<main class="chat-screen">
	<header class="chat-screen__header">
		<div class="chat-screen__header-avatar">
			<img src="/images/story-avatar.png" alt="Detective Night" />
		</div>
		<span class="chat-screen__header-name">Detective Night</span>
		<img
			src="/images/verified-badge.png"
			alt="Verificado"
			class="chat-screen__header-badge"
		/>
	</header>

	<div class="chat-screen__body">
		{#if showText}
			<div class="chat-screen__bubble chat-screen__bubble--text" class:chat-screen__bubble--visible={showText}>
				<p class="chat-screen__bubble-text">Detetive, recebi informações de que esse homem pode estar envolvido no caso João Picadinho.</p>
				<span class="chat-screen__bubble-time">{timeText}
					<svg class="chat-screen__check" viewBox="0 0 16 11" width="16" height="11">
						<path d="M11.07 0.73l-7.02 7.07-2.12-2.12L0.88 6.73l3.18 3.18L12.12 1.78z" fill="currentColor"/>
						<path d="M14.07 0.73l-7.02 7.07-0.71-0.71 1.06-1.06 5.61-5.65z" fill="currentColor"/>
					</svg>
				</span>
			</div>
		{/if}

		{#if showPhoto}
			<div class="chat-screen__bubble chat-screen__bubble--photo" class:chat-screen__bubble--visible={showPhoto}>
				<div class="chat-screen__photo-wrapper">
					<img src="/images/suspect-photo.png" alt="Foto recebida" class="chat-screen__photo" />
					<span class="chat-screen__photo-time">{timePhoto}
						<svg class="chat-screen__check" viewBox="0 0 16 11" width="16" height="11">
							<path d="M11.07 0.73l-7.02 7.07-2.12-2.12L0.88 6.73l3.18 3.18L12.12 1.78z" fill="currentColor"/>
							<path d="M14.07 0.73l-7.02 7.07-0.71-0.71 1.06-1.06 5.61-5.65z" fill="currentColor"/>
						</svg>
					</span>
				</div>
			</div>
		{/if}

		{#if showName}
			<div class="chat-screen__bubble chat-screen__bubble--text" class:chat-screen__bubble--visible={showName}>
				<p class="chat-screen__bubble-text">O nome dele é André Mattos.</p>
				<span class="chat-screen__bubble-time">{timeName}
					<svg class="chat-screen__check" viewBox="0 0 16 11" width="16" height="11">
						<path d="M11.07 0.73l-7.02 7.07-2.12-2.12L0.88 6.73l3.18 3.18L12.12 1.78z" fill="currentColor"/>
						<path d="M14.07 0.73l-7.02 7.07-0.71-0.71 1.06-1.06 5.61-5.65z" fill="currentColor"/>
					</svg>
				</span>
			</div>
		{/if}
	</div>

	{#if showButton}
		<footer class="chat-screen__footer" class:chat-screen__footer--visible={showButton}>
			<button type="button" class="chat-screen__advance" onclick={advance}>
				AVANÇAR
			</button>
		</footer>
	{/if}
</main>
