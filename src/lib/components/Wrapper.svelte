<!-- <script lang="ts">
  import { Canvas } from '@threlte/core'
  import Physics from './v3/Index.svelte'

  let width   = window.innerWidth
  let height  = window.innerHeight
</script>

<Canvas size={{ width, height  }}>
  <Physics />
</Canvas> -->

<script>
  import { data, onTop } from "$lib/store"
  import { onMount } from "svelte"
  
  import "../../app.css"
  import WalkScene from "./WalkScene.svelte"
  import MapScene from "./MapScene.svelte"
  import GUI from "./GUI/index.svelte"

  // const apiUrl = "https://far-near.media/wp-json/wp/v2/shop"
  const apiUrl = "https://far-near.media/wp-json/wp/v2/articles?per_page=100"

  let insetContainer = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
  `

  /**
   * Get data
   */
   async function getData () {
    try {
      const response = await fetch(apiUrl)
  
      $data = await response.json()
    } catch (error) {
      console.error(error)
    }
  }

  onMount(getData)
</script>

<GUI />

<div
style="{insetContainer}"
style:z-index={$onTop === 'map' ? 1 : 0}
>
<MapScene />
</div>
<div
  style="{insetContainer}"
  style:z-index={$onTop === 'walk' ? 1 : 0}
>
  <WalkScene />
</div>