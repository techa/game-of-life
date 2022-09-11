<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { drag } from '../actions/drag'
	import { writable, type Writable } from 'svelte/store'
	import Handle from './Handle.svelte'

	const dispatch = createEventDispatcher()
	const dragging: Writable<Element | null> = writable(null)

	export let handle = true
	export let handleWidth = 0

	export let value = 0
	export let min = 0
	export let max = 100
	export let step = 1
	export let direction: 'horizontal' | 'vertical' = 'horizontal'
	export let reverse = false
	export let gradient = ['white', 'black']

	// box size
	let width: number
	let height: number

	let turn = 0
	let position = 0

	$: vertical = direction === 'vertical'

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
	class="slider {direction} {$$props.class || ''}"
	style={$$props.style}
	style:background={`linear-gradient(${turn}turn, ${gradient})`}
	bind:clientWidth={width}
	bind:clientHeight={height}
	use:drag={dragging}
	on:drag={setValue}
>
	{#if handle}
		<Handle
			{direction}
			{value}
			{dragging}
			digit={max === 1 && min === 0 ? 2 : 0}
			bottom={vertical ? position : 0}
			left={vertical ? 0 : position}
		/>
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
</style>
