<script lang="ts">
	// import {} from '../store.js'
	import SVG from '../../resource/sprite.svg'
</script>

<p>
	<a
		title="Link to Github Repository"
		href="https://github.com/techa/game-of-life"
	>
		<svg>
			<use href="{SVG}#github" />
		</svg>
		<span>Github Repository</span>
	</a>
</p>

<style>
	p {
		margin-top: 1rem;
	}
	a:hover {
		color: rgb(var(--color-primary-500));
	}
	a > svg {
		display: inline;
	}
</style>
