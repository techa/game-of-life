<script lang="ts">
	/**
	 * https://github.com/themesberg/flowbite-svelte/blob/main/src/lib/dropdowns/Dropdown.svelte
	 * https://github.com/themesberg/flowbite-svelte/blob/main/src/lib/utils/Popper.svelte
	 */

	let contentEl: HTMLDivElement

	export let label = ''
	export let open = false

	export let trigger: 'hover' | 'click' = 'click'
	$: clickable = trigger === 'click'

	// managment of the race condition between focusin and click events
	let _blocked = false
	const block = () => (
		(_blocked = true), setTimeout(() => (_blocked = false), 500)
	)
	const showHandler = (ev: Event) => {
		if (clickable && ev.type === 'focusin' && !open) block()
		open = ev.type === 'click' && !_blocked ? !open : true
	}

	const hideHandler = () => {
		setTimeout(
			() => contentEl.contains(document.activeElement) || (open = false),
			100,
		)
	}
</script>

<div class="dropdown-wapper">
	<div
		class="label-wapper"
		on:focusin={showHandler}
		on:focusout={hideHandler}
		on:mouseenter={clickable ? undefined : showHandler}
		on:mouseleave={clickable ? undefined : hideHandler}
		on:click={clickable ? showHandler : undefined}
	>
		<slot name="trigger">
			<button>
				<slot name="label">{label}</slot>
			</button>
		</slot>
	</div>
	<div
		class={'dropdown ' + ($$props.class || '')}
		class:hidden={!open}
		style={$$props.style}
		role="tooltip"
		tabindex={-1}
		bind:this={contentEl}
		on:focusin={showHandler}
		on:focusout={hideHandler}
		on:mouseenter={clickable ? undefined : showHandler}
		on:mouseleave={clickable ? undefined : hideHandler}
	>
		<slot />
	</div>
</div>

<style>
	.dropdown-wapper {
		position: relative;
	}
	.label-wapper {
		display: flex;
	}
	.dropdown {
		display: block;
		position: absolute;
		top: 100%;
		max-height: 50vh;
		overflow-x: hidden;
		overflow-y: auto;

		transition-duration: 0.3s;
		transition-property: opacity;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

		z-index: 100;
	}
	.hidden {
		opacity: 0;
		display: none;
	}
</style>
