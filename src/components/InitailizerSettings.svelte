<script lang="ts">
	import Modal from './Modal.svelte'

	import { initSettings } from './store'
</script>

{#if $initSettings}
	<Modal on:close={() => ($initSettings = false)}>
		<h3 slot="header">Random settings</h3>
		<div class="map">
			<div class="left-column">
				<button>Random</button>
				<button>Random</button>
				<button>Random</button>
			</div>
			<div class="canvas-wrapper">
				<canvas />
			</div>
			<div class="y_area">
				<input type="range" name="" id="" />
				<button> y </button>
			</div>
			<div class="x_area">
				<input type="range" name="" id="" />
				<button> x </button>
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
	canvas {
		border: 1px solid #ddd;
	}
</style>
