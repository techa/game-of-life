<!-- Copy from: https://svelte.dev/examples/modal -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { TabGroup, Tab } from '@skeletonlabs/skeleton'
	import SVG from '../../resource/sprite.svg'
	import { modal } from '../store.js'

	import Random from '../modal/Random.svelte'
	import Grid from '../modal/Grid.svelte'
	import Save from '../modal/Save.svelte'
	import Other from '../modal/Other.svelte'
	import Share from '../modal/Share.svelte'

	const dispatch = createEventDispatcher()

	let dialog: HTMLDialogElement

	const close = () => {
		dialog.close()
		$modal = false
		dispatch('close')
	}

	let tabSet = 0
	const components = [
		{ title: 'Cells', component: Grid, icon: 'grid' },
		{ title: 'Random', component: Random, icon: 'dice' },
		{ title: 'Save', component: Save, icon: 'save' },
		{ title: 'Other', component: Other, icon: 'settings' },
		{ title: 'Share', component: Share, icon: 'share' },
	]

	$: if (dialog && $modal) dialog.showModal()
</script>

<dialog
	class="variant-filled-surface flex-col w-modal-slim md:w-modal"
	class:flex={$modal}
	bind:this={dialog}
	role="presentation"
	on:close={close}
	on:click|self={close}
>
	<TabGroup justify="justify-center">
		{#each components as { title, icon }, i (i)}
			<Tab bind:group={tabSet} name="tab1" value={i} {title}>
				<svelte:fragment slot="lead">
					<svg class="w-5 h-5 inline">
						<use href="{SVG}#{icon}" />
					</svg>
				</svelte:fragment>
				<!-- <span class="text-sm">{title}</span> -->
			</Tab>
		{/each}
		<button class="btn-icon naked" on:click={close}>
			<svg>
				<use href="{SVG}#x" />
			</svg>
		</button>
	</TabGroup>

	<!-- Tab Panels --->
	<div
		class="tab-panel flex-grow w-full p-2 overflow-x-hidden overflow-y-scroll [&>div>h3]:mt-4 [&>div>h3]:mb-2"
	>
		<svelte:component this={components[tabSet].component} />
	</div>
</dialog>

<style>
	dialog {
		position: absolute;
		/* left: 50%;
		top: 50%; */
		/* width: calc(100vw - 4em); */
		height: 100%;
		max-height: 600px;

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
