<script lang="ts">
	import { colorStringToHsl } from '../utils/color.js'
	import { beforeUpdate } from 'svelte'
	import Modal from './generic/Modal.svelte'

	import {
		life,
		table,
		columns,
		rows,
		selectedColor,
		initSettingsOpen,
		randomAreaColumns,
		randomPoints,
	} from './store'

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	const redraw = () => {
		const [h, s, l] = colorStringToHsl($selectedColor)
		const hsl = `hsl(${h},${s}%,${l}%,`

		if (ctx) {
			ctx.clearRect(0, 0, $columns, $rows)
			for (let y = 0; y < $rows; y++) {
				for (let x = 0; x < $columns; x++) {
					if ($table[y]) {
						ctx.fillStyle = hsl + `${life.randomValue(x, y)})`
						ctx.fillRect(x, y, 1, 1)
					} else break
				}
			}
			// console.log('canvas redraw')
		}
	}
	beforeUpdate(() => {
		if (canvas && !ctx) {
			ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		}
		redraw()
	})

	randomPoints.subscribe(redraw)
</script>

{#if $initSettingsOpen}
	<Modal on:close={() => ($initSettingsOpen = false)}>
		<h3 slot="header">Random settings</h3>
		<div class="map">
			<div class="left-column">
				<button>Random</button>
				<button>Random</button>
				<button>Random</button>
			</div>
			<div class="canvas-wrapper">
				<canvas bind:this={canvas} width={$columns} height={$rows} />
				<div class="areas">
					{#each Array(life.area).fill(0) as point}
						<div />
					{/each}
				</div>
				<div
					class="points"
					style:grid-template-columns={`repeat(${
						$randomAreaColumns + 1
					}, 1fr)`}
				>
					{#each $randomPoints as point, i (i)}
						<div
							class="point {life.pointDirectionClass(i)}"
							class:harf={life.isPointEdge(i)}
						>
							<input
								type="number"
								min="0"
								max="100"
								placeholder="%"
								bind:value={point}
							/>
						</div>
					{/each}
				</div>
			</div>
			<div class="y_area">
				<button
					on:click={() => {
						randomPoints.addRows(0)
					}}
				>
					+
				</button>
				<button
					on:click={() => {
						randomPoints.removeRows(0)
					}}
				>
					-
				</button>
				<button
					on:click={() => {
						randomPoints.removeRows()
					}}
				>
					-
				</button>
				<button
					on:click={() => {
						randomPoints.addRows()
					}}
				>
					+
				</button>
			</div>
			<div class="x_area">
				<button
					on:click={() => {
						randomPoints.addColumns(0)
					}}
				>
					+
				</button>
				<button
					on:click={() => {
						randomPoints.removeColumns(0)
					}}
				>
					-
				</button>
				<button
					on:click={() => {
						randomPoints.removeColumns()
					}}
				>
					-
				</button>
				<button
					on:click={() => {
						randomPoints.addColumns()
					}}
				>
					+
				</button>
			</div>

			<div class="other">
				<button>FillEdge</button>
			</div>
		</div>
	</Modal>
{/if}

<style>
	.map {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: auto 1fr;
	}
	.left-column {
		grid-row-start: 1;
		grid-row-end: 3;
	}
	.canvas-wrapper {
		position: relative;
	}
	canvas {
		/* border: 1px solid #ddd; */
		width: 100%;
		height: 100%;
		min-width: 200px;
		image-rendering: pixelated;
		z-index: -1;
	}
	.canvas-wrapper > div {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: grid;
		/* grid-template-columns: repeat(3, 1fr); */
	}
	.point {
		display: flex;
	}
	.point > input {
		display: block;
		width: 3rem;
		height: 1rem;
	}
	/* https://tailwindcss.com/docs/align-items */
	.items-start {
		align-items: flex-start;
	}
	.items-end {
		align-items: flex-end;
	}
	.items-center {
		align-items: center;
	}
	/* https://tailwindcss.com/docs/justify-content */
	.justify-start {
		justify-content: start;
	}
	.justify-end {
		justify-content: end;
	}
	.justify-center {
		justify-content: center;
	}
</style>
