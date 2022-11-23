<script lang="ts">
  import { data, onTop } from "$lib/stores"
  import { onMount } from "svelte"
  import { Canvas } from '@threlte/core'
  import Physics from './main/Index.svelte'
  import Stats from "./GUI/Stats.svelte"
  
  import GUI from "./GUI/index.svelte"

  let page = 1
  let apiUrl = `https://far-near.media/wp-json/wp/v2/articles?orderby=date&per_page=12&page=${page}`

  let insetContainer = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
  `
  let width   = window.innerWidth
  let height  = window.innerHeight

  $: {
    apiUrl = `https://far-near.media/wp-json/wp/v2/articles?orderby=date&per_page=12&page=${page}`
    getData()
  }

  /**
   * Get data
   */
   async function getData () {
    try {
      const response = await fetch(apiUrl)
  
      $data = [...$data, ...await response.json()]
      const total = Number(response.headers.get('x-wp-totalpages'))
      
      if (page < total) {
        page++
      }
    } catch (error) {
      console.error(error)
    }
  }

  onMount(getData)
</script>

<Canvas size={{ width, height  }}>
  <Physics />

  {#if import.meta.env.DEV}
    <Stats />
  {/if}
</Canvas>
