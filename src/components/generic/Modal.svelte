<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte'
	import SVG from '../../resource/sprite.svg'

	const dispatch = createEventDispatcher()
	const close = () => dispatch('close')

	let modal: HTMLDivElement

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

<div class="modal-background" on:click={close} />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
	<!-- svelte-ignore a11y-autofocus -->
	<div class="close" autofocus on:click={close}>
		<svg>
			<use href="{SVG}#x" />
		</svg>
	</div>
	<slot name="header" />
	<hr />
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

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: block;

		border: none;
		color: #eee;
	}
	.close:hover {
		color: var(--primary-color);
	}
</style>
