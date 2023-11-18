<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { writable, type Writable } from 'svelte/store'
	import { createEventDispatcher, setContext, onDestroy } from 'svelte'
	import SVG from '../../resource/sprite.svg'

	const dispatch = createEventDispatcher()
	const close = () => dispatch('close')

	let modal: HTMLDivElement

	const header = writable('')
	setContext<Writable<string>>('ModalHeader', header)

	const handle_keydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close()
			return
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes: HTMLElement[] = Array.from(modal.querySelectorAll('*'))
			const tabbable = nodes.filter((n) => n.tabIndex >= 0)

			let index = tabbable.indexOf(document.activeElement as HTMLElement)
			if (index === -1 && e.shiftKey) index = 0

			index += tabbable.length + (e.shiftKey ? -1 : 1)
			index %= tabbable.length

			tabbable[index].focus()
			e.preventDefault()
		}
	}

	const previously_focused = document?.activeElement as HTMLElement

	if (previously_focused) {
		onDestroy(() => {
			previously_focused.focus()
		})
	}
</script>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" role="presentation" on:click={close} />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
	<button class="close skeleton" on:click={close}>
		<svg>
			<use href="{SVG}#x" />
		</svg>
	</button>
	<h3>{$header}</h3>
	<slot />
</div>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%, -50%);
		padding: 1em;
		border-radius: 0.2em;
		background: var(--black);
	}

	h3 {
		margin: 0 0 1.2rem;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: block;

		color: #eee;
	}
	.close:hover {
		color: var(--primary-color);
	}
</style>
