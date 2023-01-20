<script lang="ts">
  import { data, onTop } from "$lib/stores"
  import { onMount } from "svelte"
  import { Canvas } from '@threlte/core'
  import Physics from './main/Index.svelte'
  import Map from './main/Map.svelte'
  import Overlay from './Overlay.svelte'
  import Stats from "./GUI/Stats.svelte"

  let page = 1
  // let apiUrl = "/data/data.json"
  let apiUrl = `https://far-near.media/wp-json/wp/v2/articles?orderby=date&per_page=12&page=${page}`

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
      const d = []
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          d.push({
            acf: {
              preview_image: { url: '/workaround/4.1.jpg' },
              article_by: 'manegame',
              uuid: 'i-' + i + '-j-' + j,
              src: '/workaround/4.1.jpg',
              title: 'Title ' + i + 1,
              author: 'manegame'
            },
            title: 'Title ' + i,
            date: new Date().setFullYear(2010 + i)
          })
        }
      }
      $data = d
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

  <!-- {#if import.meta.env.DEV} -->
    <Stats />
  <!-- {/if} -->
</Canvas>
