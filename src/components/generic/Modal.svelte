<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { writable, type Writable } from 'svelte/store'
	import { createEventDispatcher, setContext, onDestroy } from 'svelte'
	import SVG from '../../resource/sprite.svg'
	import { modal } from '../store.js'

	// export let showModal = false // !!$modal

	const dispatch = createEventDispatcher()
	const close = () => dispatch('close')

	let dialog: HTMLDialogElement

	$: if (dialog && $modal) dialog.showModal()

	const header = writable('')
	setContext<Writable<string>>('ModalHeader', header)
</script>

<dialog
	bind:this={dialog}
	on:close={() => ($modal = null)}
	on:click|self={() => dialog.close()}
>
	<button class="close skeleton" on:click={close}>
		<svg>
			<use href="{SVG}#x" />
		</svg>
	</button>
	<h3>{$header}</h3>
	<slot />
</dialog>

<style>
	dialog {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%, -50%);
		padding: 1em;

		background: var(--black);
		color: var(--white);

		border-radius: 0.5em;
		border: 1px #444 solid;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	h3 {
		margin: 0 0 1.2rem;
	}

	.close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: block;

		color: #eee;
	}
	.close:hover {
		color: var(--primary-color);
	}
</style>
