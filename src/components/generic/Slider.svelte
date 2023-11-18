<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { drag } from '../actions/drag'
	import { writable, type Writable } from 'svelte/store'

	const dispatch = createEventDispatcher()
	const dragging: Writable<Element | null> = writable(null)

	export let handle = true
	export let handleWidth = 0

	export let value = 0
	export let min = 0
	export let max = 100
	export let step = 1
	export let orientation: 'horizontal' | 'vertical' = 'horizontal'
	export let reverse = false
	export let gradient = ['white', 'black']

	// box size
	let width: number
	let height: number

	let turn = 0
	let position = 0

	$: vertical = orientation === 'vertical'

	$: {
		turn = 0 + (vertical ? 0 : -0.25) + (reverse ? 0 : 0.5)
	}

	$: {
		const _size = vertical ? height : width
		let per = (value - min) / (max - min)
		if (reverse) {
			per = 1 - per
		}
		position = (_size - handleWidth) * per + handleWidth / 2
	}

	const setValue = (e: any) => {
		const { x, y, clamp } = e.detail

		// calc position
		let per = vertical
			? 1 - clamp(y, height) / height
			: clamp(x, width) / width

		if (reverse) {
			per = 1 - per
		}

		// position to value
		const val = (max - min) * per + min
		value = clamp(Math.round(val / step) * step, max, min)

		dispatch('change', value)
	}
</script>

<div
	class="slider {orientation} {$$props.class || ''}"
	style={$$props.style}
	style:background={`linear-gradient(${turn}turn, ${gradient})`}
	role="slider"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-orientation={orientation}
	tabindex={-1}
	bind:clientWidth={width}
	bind:clientHeight={height}
	use:drag={dragging}
	on:drag={setValue}
>
	{#if handle}
		<div
			class="handle {orientation}"
			class:dragging={$dragging}
			style:bottom={`${vertical ? position : 0}px`}
			style:left={`${vertical ? 0 : position}px`}
		>
			{+value.toFixed(max === 1 && min === 0 ? 2 : 0)}
		</div>
	{/if}
</div>

<style>
	.slider {
		position: relative;
		flex: 1 0 var(--cell-size, 24px);
	}

	.slider.vertical {
		width: var(--cell-size, 24px);
		cursor: row-resize;
	}

	.slider.horizontal {
		height: var(--cell-size, 24px);
		cursor: col-resize;
	}

	/* Handle -------- */

	.handle {
		--size: 14px;
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2);

		position: absolute;
		bottom: 0;
		left: 0;

		border-radius: calc(var(--size) / 2);

		border: 1px solid var(--black);

		color: transparent;
		background-color: var(--background-color);

		pointer-events: none;
		user-select: none;

		/* box-shadow:
			0 0 2.5px 0 rgba(255, 255, 255, 0.5),
			inset 0 0 2.5px 0 rgba(255, 255, 255, 0.5); */
	}

	.handle.vertical {
		--size: 8px;
		width: calc(100% + 2px);
		height: var(--size);
		margin: calc(var(--size) / -2) -1px;
	}

	.handle.horizontal {
		--size: 8px;
		width: var(--size);
		height: calc(100% + 2px);
		margin: -1px calc(var(--size) / -2);
	}

	:global(:hover) > .handle.vertical,
	:global(:hover) > .handle.horizontal,
	.handle.vertical.dragging,
	.handle.horizontal.dragging {
		--size: var(--cell-size, 24px);
		width: var(--cell-size, 24px);
		height: var(--cell-size, 24px);

		border-radius: 50%;

		color: var(--black);

		--x: calc(var(--cell-size, 24px) - 3px);
		text-align: center;
		font-size: calc(var(--x, 24px) * 0.5);
		line-height: var(--cell-size, 24px);
	}
</style>
