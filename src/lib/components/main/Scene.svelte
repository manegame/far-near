<script lang="ts">
	import {
		DirectionalLight,
    AmbientLight,
    Fog,
    useThrelte,
    useFrame
	} from '@threlte/core'
  import { Vector3, Color } from "three"
  import { onTop, locked, epochs, lighting, terrainReady, waterReady } from "$lib/stores"
  import { currentObject } from "$lib/functionality/raycaster"
	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import Sky from './Sky.svelte'
  import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
  
  let position = new Vector3(0, 5, 0)

  let positions = [
    new Vector3(-50, 100, -50),
    new Vector3(-125, 100, 0),
    new Vector3(-250, 100, 0),
    new Vector3(-500, 100, 50),
    new Vector3(-700, 100, 150)
  ]
  let combinedColor
  
  const { scene, camera } = useThrelte()

  function onKeyDown (e) {
		 switch(e.keyCode) {
       case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
       case(27):
        if ($onTop === 'walk') {
          $onTop = 'map'
        }
        break
     }
  }

  function onLeave (e) {
    $locked = true
    setTimeout(() => {
      window.location = `https://far-near.media/stories/${e.detail}`
    }, 500)
  }

  function fadeIn () {
    console.log('fade in')
    scene.traverse(object => {
      if (object?.material) {
        if (object.material.opacity) {
          new TWEEN.Tween(object.material)
            .to({ opacity: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()
        }
      }
    })
  }

  function fadeOut () {
    console.log('fade out')
    if (!$locked) {
      scene.traverse(object => {
        if (object?.material && !object?.userData.keep) {
          // console.log(object.userData.keep)
          object.material.transparent = true
          if (object.material.opacity && object?.userData?.uuid !== $currentObject.userData.uuid) {
            new TWEEN.Tween(object.material)
              .to({ opacity: 0.1 }, 500)
              .easing(TWEEN.Easing.Cubic.Out)
              .start()
          }
        }
      })
    }
  }

  useFrame(() => {
    TWEEN.update()
  })
</script>

<svelte:window on:keydown={onKeyDown} />

<AmbientLight intensity={$lighting.ambient} color={combinedColor} />

{#if $camera}
  <Player
    on:leave={onLeave}
    bind:position={position}
  />

  <DirectionalLight
    intensity={$lighting.ambient}
    color={combinedColor}
    position={{ y: 50, x: position.x, z: position.z }}
    target={{ x: position.x, z: position.z - 50 }}
  />
{/if}

{#if $terrainReady && $waterReady}
  {#each Object.keys($epochs) as year, i (i)}
    <Epoch
      {year}
      position={positions[i]}
      epoch={$epochs[year]}
      radius={80}
    />
  {/each}
{/if}

<Terrain
  color={combinedColor}
  on:ready={(e) => { $terrainReady = true }}
/>

<Fog near={50} far={400} color={combinedColor} />

<Sky color={combinedColor} />

{#if import.meta.env.DEV}
  <!-- <HitIndicator /> -->
{/if}

<!-- <Debug /> -->

<!-- <Emitter /> -->