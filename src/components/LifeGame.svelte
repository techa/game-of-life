<script lang="ts">
	import { onMount } from 'svelte'

	import TableManager from './TableManager.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
	import PixelDraw from './PixelDraw.svelte'

	import Modal from './generic/Modal.svelte'
	import {
		life,
		tableViewMode,
		isRunning,
		table,
		selectedColor,
		penMode,
		tooltipShow,
		templateLoaded,
		gridShow,
		gridColorCentral,
		gridCursor,
		gridCentral,
	} from './store'
	import { hexToRgb } from '../utils/color.js'

	import { isSmartPhone } from '../utils/miscellanies.js'
	import { computePosition, offset, flip, shift } from '@floating-ui/dom'

	let isPC = false
	let cell_state = 0
	let cursor_position_x = 0
	let cursor_position_y = 0
	let tooltip: HTMLDivElement
	let tooltipVisible = false

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
		viewMode={tableViewMode}
		{gridShow}
		{gridCursor}
		{gridCentral}
		{gridColorCentral}
		on:mousemove={(e) => {
			if (!tooltip) {
				return
			}
			const { x, y, mouseEvent } = e.detail
			const { clientX, clientY } = mouseEvent
			cursor_position_x = x
			cursor_position_y = y
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
				middleware: [offset(14), flip(), shift()],
			}).then(({ x, y }) => {
				Object.assign(tooltip.style, {
					top: `${y + 24}px`,
					left: `${x}px`,
				})
			})
		}}
		on:mouseenter={() => {
			tooltipVisible = true
		}}
		on:mouseleave={() => {
			tooltipVisible = false
		}}
		on:drawDot={(e) => {
			const { dots, screen, x, y, w, h, pen } = e.detail
			if (pen && !$penMode) {
				// when pen-mode disabled
				return
			}

			const cell_state = life.cells.get(x, y)
			if (cell_state > 0 || cell_state === -1) {
				dots.fillStyle = life.getColor(cell_state)
				dots.fillRect(x, y, 1, 1)
			} else if (!(cell_state % 2)) {
				// cell_state == 0 or -2
				dots.clearRect(x, y, 1, 1)
			}

			// Processing stops here during playing
			if ($isRunning) {
				return
			}

			// draw screen UNDEAD & TOMB ✖
			const scX = x * w
			const scY = y * h

			if (cell_state >= 0) {
				screen.clearRect(scX, scY, w, h)
			} else {
				screen.strokeStyle = $penMode === -1 ? '#2d1e33' : 'white'

				screen.beginPath()
				screen.moveTo(scX, scY)
				screen.lineTo(scX + w, scY + h)
				screen.closePath()
				screen.stroke()

				screen.beginPath()
				screen.moveTo(scX + w, scY)
				screen.lineTo(scX, scY + h)
				screen.closePath()
				screen.stroke()
			}
		}}
		on:setValue={(e) => {
			const { x, y, mouseEvent } = e.detail
			if ($penMode && /^mouse/.test(mouseEvent.type)) {
				if (mouseEvent.type === 'mousedown') {
					cell_state = life.cells.get(x, y) ? 0 : $penMode
				}
				$templateLoaded = false

				life.cells.setValue(e.detail, cell_state)
			}
		}}
	/>

	{#if isPC && $tooltipShow}
		<div
			class="mouse_tooltip chip variant-glass-tertiary absolute w-max top-0 left-0 pointer-events-none"
			style:visibility={tooltipVisible ? 'visible' : 'hidden'}
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

	<Modal />
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
