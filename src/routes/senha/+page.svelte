<script lang="ts">
	import { goto } from '$app/navigation';
	import { playClick } from '$lib/sfx';

	const CORRECT_CODE = '47';
	const CODE_LENGTH = 2;

	const keys = [
		{ digit: '1', letters: '' },
		{ digit: '2', letters: 'ABC' },
		{ digit: '3', letters: 'DEF' },
		{ digit: '4', letters: 'GHI' },
		{ digit: '5', letters: 'JKL' },
		{ digit: '6', letters: 'MNO' },
		{ digit: '7', letters: 'PQRS' },
		{ digit: '8', letters: 'TUV' },
		{ digit: '9', letters: 'WXYZ' }
	];

	let entered = $state('');
	let shaking = $state(false);
	let error = $state(false);

	function pressKey(digit: string) {
		if (shaking) return;
		if (entered.length >= CODE_LENGTH) return;
		playClick();

		entered += digit;

		if (entered.length === CODE_LENGTH) {
			setTimeout(checkCode, 180);
		}
	}

	function checkCode() {
		if (entered === CORRECT_CODE) {
			goto('/mensagem');
		} else {
			error = true;
			shaking = true;
			navigator.vibrate?.([ 80, 60, 80 ]);
			setTimeout(() => {
				shaking = false;
				error = false;
				entered = '';
			}, 650);
		}
	}

	function handleDelete() {
		if (shaking) return;
		entered = entered.slice(0, -1);
	}
</script>

<main class="passcode-screen">
	<header class="passcode-screen__header">
		<p class="passcode-screen__hint">
			A senha é a marca registrada de Claudemir
		</p>
		<p class="passcode-screen__hint passcode-screen__hint--sub">
			{CODE_LENGTH} dígitos
		</p>
	</header>

	<div class="passcode-screen__dots" class:passcode-screen__dots--shake={shaking}>
		{#each Array(CODE_LENGTH) as _, i}
			<span
				class="passcode-screen__dot"
				class:passcode-screen__dot--filled={i < entered.length}
				class:passcode-screen__dot--error={error}
			></span>
		{/each}
	</div>

	<div class="passcode-screen__keypad">
		{#each keys as key (key.digit)}
			<button
				type="button"
				class="passcode-screen__key"
				onclick={() => pressKey(key.digit)}
				disabled={shaking}
			>
				<span class="passcode-screen__key-digit">{key.digit}</span>
				{#if key.letters}
					<span class="passcode-screen__key-letters">{key.letters}</span>
				{/if}
			</button>
		{/each}

		<span class="passcode-screen__key-spacer"></span>

		<button
			type="button"
			class="passcode-screen__key"
			onclick={() => pressKey('0')}
			disabled={shaking}
		>
			<span class="passcode-screen__key-digit">0</span>
		</button>

		<button
			type="button"
			class="passcode-screen__key passcode-screen__key--delete"
			onclick={handleDelete}
			disabled={shaking || entered.length === 0}
			aria-label="Apagar"
		>
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
			<path d="M9 3.5h8.5a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H9l-6.5-8.5L9 3.5z" />
			<line x1="13" y1="9" x2="17" y2="15" />
			<line x1="17" y1="9" x2="13" y2="15" />
		</svg>
		</button>
	</div>

	<footer class="passcode-screen__footer">
		<button type="button" class="quiz-screen__skip" onclick={() => { playClick(); goto('/mensagem'); }}>Pular Enigma</button>
	</footer>
</main>
