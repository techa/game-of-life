<script lang="ts">
	import '../app.css'

	import LifeGame from '../components/LifeGame.svelte'
	export const ssr = false
	export const prerender = true
</script>

<LifeGame />
