<script lang="ts">
  import { data, onTop } from "$lib/store"
  import { onMount } from "svelte"
  import { Canvas } from '@threlte/core'
  import Physics from './main/Index.svelte'
  
  import GUI from "./GUI/index.svelte"

  // const apiUrl = "https://far-near.media/wp-json/wp/v2/shop"
  const apiUrl = "https://far-near.media/wp-json/wp/v2/articles?per_page=5"

  let insetContainer = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
  `
  let width   = window.innerWidth
  let height  = window.innerHeight

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

<Canvas size={{ width, height  }}>
  <Physics />
</Canvas>