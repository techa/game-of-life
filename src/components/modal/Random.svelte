<script lang="ts">
	import { colorStringToHsl } from '../../utils/color.js'
	import { afterUpdate, onMount } from 'svelte'

	import { SavesStrage } from '../../utils/SavesStrage.js'

	import SVG from '../../resource/sprite.svg'

	import {
		life,
		table,
		columns,
		rows,
		selectedColor,
		randomAreaColumns,
		randomAreaRows,
		randomPoints,
		edgeColumn,
		edgeRow,
	} from '../store.js'

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
	onMount(() => {
		if (canvas && !ctx) {
			ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		}
		redraw()
	})
	afterUpdate(() => {
		redraw()
	})

	const randomSaves = new SavesStrage(
		'RandomSaves',
		Array(10)
			.fill(0)
			.map(() => life.points.get2d()),
	)
	let saveIndex = randomSaves.index
	const save = () => {
		randomSaves.set(saveIndex, life.points.get2d())
	}
	randomPoints.subscribe(save)
</script>

<div class="wrapper">
	<div class="left-column">
		{#each randomSaves.data as savedata, i}
			<div class="savedata">
				<button
					class="btn bg-initial"
					class:active={saveIndex === i}
					style:background-color={saveIndex === i
						? $selectedColor
						: ''}
					on:click={() => {
						if (i !== saveIndex) {
							life.areaInit(randomSaves.get(i))
							saveIndex = i
							$randomPoints = life.points.values
						}
					}}>Save {(i + 1 + '').padStart(2, '0')}</button
				>
			</div>
		{/each}
	</div>

	<div class="map">
		<div class="canvas-wrapper">
			<canvas bind:this={canvas} width={$columns} height={$rows} />
			<div
				class="points"
				style:grid-template-columns={$randomAreaColumns === 1
					? '1fr 1fr'
					: `1fr repeat(${$randomAreaColumns - 1}, 2fr) 1fr`}
				style:grid-template-rows={$randomAreaRows === 1
					? '1fr 1fr'
					: `1fr repeat(${$randomAreaRows - 1}, 2fr) 1fr`}
			>
				{#each $randomPoints as point, i (i)}
					<div class="point {life.pointDirectionClass(i)}">
						{#if life.isEdgeLoop(i)}
							<input
								type="number"
								disabled={true}
								value={life.getRandomPoint(i)}
							/>
						{:else}
							<input
								type="number"
								min="0"
								max="100"
								placeholder="%"
								disabled={false}
								bind:value={point}
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="x_edge flex-row">
			<div class="plmi flex-row">
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.addColumns(0)
					}}
				>
					<svg>
						<use href="{SVG}#plus" />
					</svg>
				</button>
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.removeColumns(0)
					}}
					disabled={$randomAreaColumns < 2}
				>
					<svg>
						<use href="{SVG}#minus" />
					</svg>
				</button>
			</div>
			{#each $edgeColumn as edge}
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						edge = ++edge % 2
						$randomPoints = $randomPoints
					}}
				>
					{#if edge}
						<svg>
							<use href="{SVG}#x" />
						</svg>
					{:else}
						<svg>
							<use href="{SVG}#repeat" />
						</svg>
					{/if}
				</button>
			{/each}
			<div class="plmi flex-row">
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.removeColumns()
					}}
					disabled={$randomAreaColumns < 2}
				>
					<svg>
						<use href="{SVG}#minus" />
					</svg>
				</button>
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.addColumns()
					}}
				>
					<svg>
						<use href="{SVG}#plus" />
					</svg>
				</button>
			</div>
		</div>
		<div class="y_edge flex-col">
			<div class="plmi flex-col">
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.addRows(0)
					}}
				>
					<svg>
						<use href="{SVG}#plus" />
					</svg>
				</button>
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						randomPoints.removeRows(0)
					}}
					disabled={$randomAreaRows < 2}
				>
					<svg>
						<use href="{SVG}#minus" />
					</svg>
				</button>
			</div>
			{#each $edgeRow as edge}
				<button
					class="btn-icon bg-initial btn-icon-sm mani-btn"
					on:click={() => {
						edge = ++edge % 2
						$randomPoints = $randomPoints
					}}
				>
					{#if edge}
						<svg>
							<use href="{SVG}#x" />
						</svg>
					{:else}
						<svg>
							<use href="{SVG}#repeat" />
						</svg>
					{/if}
				</button>
			{/each}

			<div class="plmi flex-col">
				<button
					class="mani-btn btn-icon bg-initial btn-icon-sm"
					on:click={() => {
						randomPoints.removeRows()
					}}
					disabled={$randomAreaRows < 2}
				>
					<svg>
						<use href="{SVG}#minus" />
					</svg>
				</button>
				<button
					class="mani-btn btn-icon bg-initial btn-icon-sm"
					on:click={() => {
						randomPoints.addRows()
					}}
				>
					<svg>
						<use href="{SVG}#plus" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<div style="margin-top: 1rem;">
	<button
		class="randomize btn bg-initial"
		style:background-color={$selectedColor}
		on:click={() => life.randomInit()}>Randomize!</button
	>
</div>

<style>
	.wrapper {
		display: flex;
	}
	.left-column {
		display: flex;
		margin-right: 0.5rem;
		/* flex-col */
		flex-flow: column nowrap;
	}
	.map {
		flex-grow: 1;
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-areas:
			'.      x_area  .'
			'y_area canvas  y_edge'
			'.      x_edge  .';
		/* grid-template-rows: 1fr auto 1fr; */
	}
	.canvas-wrapper {
		position: relative;
		grid-area: canvas;
	}
	.x_edge {
		grid-area: x_edge;
	}
	.x_area {
		grid-area: x_area;
	}
	.x_edge,
	.x_area,
	.y_edge,
	.y_area {
		display: flex;
		align-content: space-between;
		justify-content: space-between;
	}
	.y_edge {
		grid-area: y_edge;
	}
	.y_area {
		grid-area: y_area;
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
	.plmi {
		display: flex;
	}
	.point {
		display: flex;
	}
	.point > input {
		display: block;
		width: 3rem;
		height: 1rem;
	}

	.savedata button.active,
	.randomize {
		background-color: rgb(var(--color-primary-500));
		color: var(--black);
	}

	.mani-btn {
		border: var(--white) 1px solid;
	}

	.mani-btn.active,
	.mani-btn:active,
	.mani-btn:hover {
		border: rgb(var(--color-primary-500)) 1px solid;
	}
</style>
