<script lang="ts">
	import type { Writable } from 'svelte/store'

	export let direction = ''
	export let value = 0
	export let digit = 0
	export let top = 0
	export let bottom = 0
	export let right = 0
	export let left = 0

	export let dragging: Writable<Element | null>

	const keys = ['top', 'bottom', 'right', 'left']
	$: style = [top, bottom, right, left].reduce((str, v, i) => {
		if (v != null) {
			str += `${keys[i]}: ${v}px;`
		}
		return str
	}, '')
</script>

<div
	class="handle {direction}"
	class:dragging={$dragging}
	style={style + $$props.style}
>
	{+value.toFixed(digit)}
</div>

<style>
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
