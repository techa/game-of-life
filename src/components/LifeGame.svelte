<script lang="ts">
	import { onMount, type ComponentType } from 'svelte'

	import TableManager from './TableManager.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
	import InitializerSettings from './InitializerSettings.svelte'
	import PixelDraw from './PixelDraw.svelte'

	import Modal from './generic/Modal.svelte'
	import {
		life,
		table,
		modal,
		ModalsHeader,
		selectedColor,
		gridView,
		penMode,
		tooltipShow,
		gridColorCentral,
	} from './store'
	import { hexToRgb } from '../utils/color.js'

	import { LifeEvent } from '$lib/LifeGame.js'

	import { isSmartPhone } from '../utils/miscellanies.js'
	import { computePosition, offset, flip, shift } from '@floating-ui/dom'

	/**
	 * var for pen tool
	 */
	let settingValue = 1

	const _modal: Record<ModalsHeader, ComponentType> = {
		[ModalsHeader.Random]: InitializerSettings,
	}

	let isPC = false
	let cell_state = 0
	let cursor_position_x = 0
	let cursor_position_y = 0
	let tooltip: HTMLDivElement

	onMount(() => {
		$table = $table
		isPC = !isSmartPhone()
	})
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<main style:--color-primary-500={hexToRgb($selectedColor).join(' ')}>
	<div class="tools h-32">
		<TableManager />
		<LifeGameManager />
	</div>

	<PixelDraw
		style={`height: calc(100vh - 8rem);`}
		cells={table}
		gridShow={gridView}
		{gridColorCentral}
		on:mousemove={(e) => {
			const { x, y, mouseEvent } = e.detail
			const { clientX, clientY } = mouseEvent
			cursor_position_x = x
			cursor_position_y = y
			cell_state = life.cells.get(x, y)
			const virtualEl = {
				getBoundingClientRect() {
					const w = 12
					const h = 12
					return {
						width: w,
						height: h,
						x: clientX - w / 2,
						y: clientY - h / 2,
						left: clientX - w / 2,
						right: clientX - w / 2,
						top: clientY - h / 2,
						bottom: clientY - h / 2,
					}
				},
			}

			computePosition(virtualEl, tooltip, {
				placement: 'right-start',
				middleware: [offset(16), flip(), shift()],
			}).then(({ x, y }) => {
				Object.assign(tooltip.style, {
					top: `${y + 14}px`,
					left: `${x}px`,
				})
			})
		}}
		on:mouseenter={() => {
			$tooltipShow = true
		}}
		on:mouseleave={() => {
			$tooltipShow = false
		}}
		on:drawDot={(e) => {
			const { ctx, x, y } = e.detail
			cell_state = life.cells.get(x, y)
			if (cell_state > 0 || cell_state === -1) {
				ctx.fillStyle = life.getColor(cell_state)
				ctx.fillRect(x, y, 1, 1)
			}
		}}
		on:optionDraw={(e) => {
			// const { ctx, x, y } = e.detail
			// if ($penMode > 0) {
			// UNDEAD TOMB
			// ctx.beginPath()
			// const w = width / columns
			// // const w = Math.round(x * cell_size)
			// ctx.moveTo(x , y)
			// ctx.lineTo(w, height)
			// ctx.closePath()
			// ctx.stroke()
			// const cell_size_h = height / rows
			// const h = Math.round(y * cell_size_h)
			// ctx.moveTo(0, h)
			// ctx.lineTo(width, h)
			// ctx.closePath()
			// ctx.stroke()
			// }
		}}
		on:setValue={(e) => {
			const { x, y, mouseEvent } = e.detail
			if (mouseEvent.type === 'mousedown') {
				settingValue = life.cells.get(x, y) ? 0 : -$penMode || 1
			}

			life.cells.setValue(e.detail, settingValue)
			life.emit(LifeEvent.UPDATE)
		}}
	/>

	{#if isPC}
		<div
			class="mouse_tooltip chip variant-glass-tertiary absolute w-max top-0 left-0 pointer-events-none"
			style:visibility={$tooltipShow ? 'visible' : 'hidden'}
			role="tooltip"
			bind:this={tooltip}
		>
			<span>
				state:
				<span class="font-mono px-1 py-0">{cell_state}</span>
			</span>
			<span>
				x:
				<span class="font-mono px-1 py-0">{cursor_position_x + 1}</span>
			</span>
			<span>
				y:
				<span class="font-mono px-1 py-0">{cursor_position_y + 1}</span>
			</span>
		</div>
	{/if}

	{#if $modal}
		<Modal on:close={() => ($modal = null)}>
			<svelte:component this={_modal[$modal]} />
		</Modal>
	{/if}
</main>

<style>
	main {
		position: relative;
		width: 100%;
		min-width: 320px;
		height: 100%;
		text-align: center;

		/* display: flex; */
		/* align-items: center; */
		/* justify-content: space-between; */
	}
</style>
