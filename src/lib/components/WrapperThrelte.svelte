<script lang="ts">
  import { data, onTop } from "$lib/stores"
  import { onMount } from "svelte"
  import { Canvas } from '@threlte/core'
  import Physics from './main/Index.svelte'
  import Map from './main/Map.svelte'
  import Overlay from './Overlay.svelte'
  import Stats from "./GUI/Stats.svelte"

  let page = 1
  let apiUrl = "/data/data.json"
  // let apiUrl = `https://far-near.media/wp-json/wp/v2/articles?orderby=date&per_page=100&page=${page}`

  let insetContainer = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
  `
  let width   = window.innerWidth
  let height  = window.innerHeight

  $: {
    // apiUrl = `https://far-near.media/wp-json/wp/v2/articles?orderby=date&per_page=100&page=${page}`
    apiUrl = `/data/data.json`
    getData()
  }

  /**
   * Get data
   */
   async function getData () {
    console.log('called the API')
    try {
      const response = await fetch(apiUrl)

      $data = [...$data, ...await response.json()]
      const total = Number(response.headers.get('x-wp-totalpages'))

      console.log(JSON.stringify($data))

      if (page < total) {
        page++
      }
    } catch (error) {
      console.error(error)
    }
  }

  onMount(getData)
</script>

<Overlay />  

{#if $onTop === 'map'}
  <Map />
{/if}

<Canvas size={{ width, height  }}>
  <Physics />

  {#if import.meta.env.DEV}
    <Stats />
  {/if}
</Canvas>
