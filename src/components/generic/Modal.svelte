<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { TabGroup, Tab } from '@skeletonlabs/skeleton'
	import SVG from '../../resource/sprite.svg'
	import { modal } from '../store.js'

	import Random from '../modal/Random.svelte'
	import Tools from '../modal/Tools.svelte'

	// export let showModal = false // !!$modal

	const dispatch = createEventDispatcher()
	const close = () => {
		dialog.close()
		$modal = false
		dispatch('close')
	}

	let dialog: HTMLDialogElement

	let tabSet = 0
	const components = [Tools, Random, Tools]

	$: if (dialog && $modal) dialog.showModal()
</script>

<dialog
	class="variant-filled-surface"
	bind:this={dialog}
	role="presentation"
	on:close={close}
	on:click|self={close}
>
	<button class="btn-icon naked absolute top-2 right-2" on:click={close}>
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
	</TabGroup>

	<!-- Tab Panels --->
	<div class="tab-panel w-full p-2">
		<svelte:component this={components[tabSet]} />
	</div>

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
		/* left: 50%;
		top: 50%; */
		width: calc(100vw - 4em);
		/* max-width: 32em; */
		height: calc(100vh - 4em);
		overflow: auto;
		/* transform: translate(-50%, -50%); */
		padding: 1em;

		/* background: rgb(var(--));
		color: var(--white); */

		border-radius: 0.5em;
		border: 1px #444 solid;

		/* visibility: hidden; */
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
</style>
