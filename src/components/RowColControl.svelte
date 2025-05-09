<script lang="ts">
	import { life, columns, rows } from './store'
</script>

<div class="x_edge">
	<div class="plmi flex flex-row">
		<button
			on:click={() => {
				life.addColumns(0)
			}}
		>
			+
		</button>
		<button
			on:click={() => {
				life.removeColumns(0)
			}}
			disabled={$columns < 2}
		>
			-
		</button>
	</div>

	<div class="plmi flex flex-row">
		<button
			on:click={() => {
				life.removeColumns()
			}}
			disabled={$columns < 2}
		>
			-
		</button>
		<button
			on:click={() => {
				life.addColumns()
			}}
		>
			+
		</button>
	</div>
</div>

<div class="y_edge flex flex-col">
	<div class="plmi flex flex-col">
		<button
			on:click={() => {
				life.addRows(0)
			}}
		>
			+
		</button>
		<button
			on:click={() => {
				life.removeRows(0)
			}}
			disabled={$rows < 2}
		>
			-
		</button>
	</div>

	<div class="plmi flex flex-col">
		<button
			on:click={() => {
				life.removeRows()
			}}
			disabled={$rows < 2}
		>
			-
		</button>
		<button
			on:click={() => {
				life.addRows()
			}}
		>
			+
		</button>
	</div>
</div>
