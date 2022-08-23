<script lang="ts">
	import { LifeGame, rules, LifeEvent, type Rule, Cell } from './LifeGame'

	import GridTable from './GridTable.svelte'

	import SVG from '../resource/sprite.svg'
	import lexicon from '../resource/lexicon.json'
	import Patterns from '../resource/patterns.json'
	// import { patterns } from '../resource/patterns'
	// navigator.clipboard.writeText(
	// JSON.stringify(patterns, null, '\t'),
	// )

	const patterns = Patterns as unknown as [string, Cell[][]][]

	const life = new LifeGame().init()
	let table = life.table
	let columns = life.columns
	let rows = life.rows

	let edgeLoop = true
	let edgeCell = !!life.edgeCell

	let stepCount = life.stepCount
	let survivalCount = 0

	let start = JSON.stringify(table)
	let playing = false
	let rule: Rule = 'B3/S23'
	let gridView = true
	let speedindex = 0

	let selectedColor = '#db4dff'

	$: life.setRule(rule)
	$: life.edgeLoop = edgeLoop
	$: life.edgeCell = +edgeCell

	life.on(LifeEvent.TABLE_UPDATE, () => {
		table = life.table
		stepCount = life.stepCount
		survivalCount = life.survivalCount
		if (!stepCount) {
			life.stop()
		}
	})
	life.on(LifeEvent.START, () => {
		playing = true
	})
	life.on(LifeEvent.STOP, () => {
		playing = false
	})
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<section>
	<nav>
		<a href="https://github.com/techa/life-game">
			<svg style="stroke: #fff;">
				<use href="{SVG}#github" />
			</svg>
		</a>
		<label>
			<input type="color" bind:value={selectedColor} />
		</label>
		<label
			>W:
			<input
				type="number"
				bind:value={columns}
				on:change={() => life.tableSizing({ columns })}
			/>
		</label>
		<label
			>H:
			<input
				type="number"
				bind:value={rows}
				on:change={() => life.tableSizing({ rows })}
			/>
		</label>

		<label>
			<svg class:active={edgeLoop}>
				<use href="{SVG}#repeat" />
			</svg>
			<input type="checkbox" class="hidden" bind:checked={edgeLoop} />
		</label>

		{#if !edgeLoop}
			<label>
				{edgeCell ? 'L' : 'D'}
				<input type="checkbox" class="hidden" bind:checked={edgeCell} />
			</label>
		{/if}

		<label>
			<svg class:active={gridView}>
				<use href="{SVG}#grid" />
			</svg>
			<input type="checkbox" class="hidden" bind:checked={gridView} />
		</label>

		<button
			on:click={() => {
				if (playing) {
					life.stop()
				} else {
					if (stepCount === 0 && survivalCount !== 0) {
						start = JSON.stringify(table)
					}
					if (survivalCount !== 0) {
						life.start()
					}
				}
			}}
		>
			<svg class="mini" class:active={playing} style:stroke={'black'}>
				<use href="{SVG}#{playing ? 'pause' : 'play'}" />
			</svg>{playing ? 'Stop' : 'Start'}</button
		>
		{#if playing}
			<button
				on:click={() => {
					speedindex = (speedindex + 1) % life.speeds.length
					life.speed = life.speeds[speedindex]
				}}
				>x{life.speeds[speedindex]}
			</button>
		{:else}
			<button
				on:click={() => {
					life.step()
				}}
				>step
			</button>
		{/if}
	</nav>

	<nav>
		<button
			on:click={() => {
				life.randomInit()
				start = JSON.stringify(table)
			}}
			>random
		</button>
		<button
			on:click={() => {
				life.randomInit(null, 'edge')
				start = JSON.stringify(table)
			}}
			>randomne
		</button>
		<button
			on:click={() => {
				life.randomInit('edge', null)
				start = JSON.stringify(table)
			}}
			>randomen
		</button>
		<button
			on:click={() => {
				life.randomInit('edge', 'edge')
				start = JSON.stringify(table)
			}}
			>randomee
		</button>

		<button
			on:click={() => {
				life.undeadInit()
				start = JSON.stringify(table)
			}}
			>Undead
		</button>

		<button
			on:click={() => {
				if (playing) {
					life.stop()
				}

				life.tableInit()
			}}
			>clear
		</button>
		<button
			on:click={() => {
				if (playing) {
					life.stop()
				}
				life.insert(JSON.parse(start))
			}}
			>reset
		</button>
		<button
			on:click={() => {
				navigator.clipboard.writeText(JSON.stringify(life.table))
			}}
			>copy
		</button>
		<label>
			<select class="pulldown">
				{#each lexicon as lexico, i}
					<option
						value={i}
						on:click={() => {
							columns = life.columns
							rows = life.rows
							life.insert(lexicon[i])
							start = JSON.stringify(table)
						}}>{i}</option
					>
				{/each}
			</select>
		</label>
		<label>
			<select class="pulldown">
				{#each patterns as [name, _rule], i}
					<option
						value={i}
						on:click={() => {
							columns = life.columns
							rows = life.rows
							life.insert(_rule)
							start = JSON.stringify(table)
						}}>{name}</option
					>
				{/each}
			</select>
		</label>
	</nav>

	<nav>
		<label>
			Born/Survival
			<input bind:value={rule} />
		</label>
		<label>
			<select class="pulldown" bind:value={rule}>
				{#each [...rules.entries()] as [name, _rule]}
					<option value={_rule}>{name}</option>
				{/each}
			</select>
		</label>
		<span>Step: {stepCount}</span>
		<span>Survival: {survivalCount}/{life.rows * life.columns}</span>
	</nav>

	<GridTable {life} {table} {columns} {rows} {gridView} {selectedColor} />

	<footer />
</section>

<style>
	section {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;

		/* display: flex; */
		/* align-items: center; */
		/* justify-content: space-between; */
	}
	nav {
		width: 100%;
		text-align: center;
		display: flex;
		justify-content: center;
	}
	input {
		width: 7rem;
		text-align: center;
		z-index: 2;
	}
	input[type='color'] {
		width: 2rem;
		border: none;
		padding: 0;
		border-radius: 8px;
	}
	input[type='number'] {
		width: 3rem;
	}
	label {
		position: relative;
	}
	.pulldown {
		width: auto;
		flex-wrap: wrap;
		flex-direction: columns;
	}

	span {
		padding: 0 4px;
	}
</style>
