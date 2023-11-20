<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { writable, type Writable } from 'svelte/store'
	import { createEventDispatcher, setContext, onDestroy } from 'svelte'

	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton'
	import SVG from '../../resource/sprite.svg'
	import { modal } from '../store.js'
	import InitializerSettings from '../InitializerSettings.svelte'

	// export let showModal = false // !!$modal

	const dispatch = createEventDispatcher()
	const close = () => dispatch('close')

	let dialog: HTMLDialogElement

	let tabSet = 0

	$: if (dialog && $modal) dialog.showModal()

	const header = writable('')
	setContext<Writable<string>>('ModalHeader', header)
</script>

<dialog
	bind:this={dialog}
	role="presentation"
	on:close={() => ($modal = null)}
	on:click|self={() => dialog.close()}
>
	<button class="close naked" on:click={close}>
		<svg>
			<use href="{SVG}#x" />
		</svg>
	</button>

	<TabGroup justify="justify-center">
		{#each ['Cells', 'Random', 'View'] as title, i (i)}
			<Tab bind:group={tabSet} name="tab1" value={i}>
				<!-- <svelte:fragment slot="lead">(icon)</svelte:fragment> -->
				<span>{title}</span>
			</Tab>
		{/each}
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				(tab panel 2 contents)
			{:else if tabSet === 1}
				<InitializerSettings />
			{:else if tabSet === 2}
				(tab panel 3 contents)
			{/if}
		</svelte:fragment>
	</TabGroup>

	<div class="footer">
		<a
			class="btn-icon"
			title="Link to Github"
			href="https://github.com/techa/game-of-life"
		>
			<svg style="stroke: #fff;">
				<use href="{SVG}#github" />
			</svg>
		</a>
	</div>
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

	.close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: block;

		color: #eee;
	}
	.close:hover {
		color: rgb(var(--color-primary-500));
	}
</style>
