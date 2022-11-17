<svelte:options tag="far-near-scene" />

<script>
  /**
   * Imports
   */
  // THREE
  import * as THREE from "three"
  import { ResourceTracker } from "$lib/threejs/ResourceTracker"
  import { EffectComposer } from "$lib/threejs/postprocessing/EffectComposer"
  import { RenderPass } from "$lib/threejs/postprocessing/RenderPass"
  import { ShaderPass } from "$lib/threejs/postprocessing/ShaderPass"
  import MonoPoleMaterial from "$lib/threejs/shader-materials/monopole"
  import TransparencyMaterial from "$lib/threejs/shader-materials/transparency"
  import RefractionReflectionMaterial from "$lib/threejs/shader-materials/refraction-reflection-fresnel"
  import { Noise } from "$lib/threejs/shaders/noise"
  import { getSizes } from "$lib/threejs/utilities"

  // Svelte
  import { onMount, onDestroy } from "svelte"
  import { spring } from "svelte/motion"
  import { range } from "$lib/functionality/maths"
  import { y } from "$lib/functionality/store"

  /**
   * Props
   */
  export let progress = 1 // a value from 0 to 1 based on scroll
  export let c1 = "rgb(0,0,255)"
  export let c2 = "rgb(255,0,0)"
  export let c3 = "rgb(0,255,0)"

  /**
   * Variables
   * Will be set in later functions
   */
  let data,
    renderer,
    camera,
    scene,
    uniforms,
    container,
    cubeRenderTarget,
    cubeCamera,
    cubeMaterial,
    innerUniforms,
    bgGeometry,
    middle,
    middleGeometry,
    innerGeometry,
    background,
    composer,
    color1,
    color2,
    color3,
    tracker,
    track,
    pointer,
    clock,
    coords

  /**
   * Variables
   * with a default
   */
  const apiUrl = "https://far-near.media/wp-json/wp/v2/shop"

  let dark = true
  let pointerDown = false
  let backgroundColor = new THREE.Vector3(0.0)
  let patternScale = 0.1
  let patternBias1 = 0.5
  let patternBias2 = 0.1

  async function getData() {
    try {
      const response = await fetch(apiUrl)

      data = await response.json()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Pre-Init:
   * Runs before mount, use this to preset variables needed in init
   */
  function preInit() {
    tracker = new ResourceTracker()
    track = tracker.track.bind(tracker)

    pointer = {
      x: 0,
      y: 0,
    }

    clock = new THREE.Clock()

    coords = spring(
      { x: 0, y: 0, z: 0 },
      {
        stiffness: 0.01,
        damping: 0.2,
      }
    )

    // If not rgb, then parse hex
    if (c1[0] !== "r" && c2 !== "r" && c3[0] !== "r") {
      const c1Hex = parseInt(c1, 16)
      const c2Hex = parseInt(c2, 16)
      const c3Hex = parseInt(c3, 16)
      color1 = new THREE.Color(c1Hex)
      color2 = new THREE.Color(c2Hex)
      color3 = new THREE.Color(c3Hex)
    } else {
      color1 = new THREE.Color(c1)
      color2 = new THREE.Color(c2)
      color3 = new THREE.Color(c3)
    }
  }

  /**
   * Init function
   */
  async function init() {
    const { w, h } = getSizes()

    createScene()
    createRenderer()
    createRenderTargets()

    background = createBackground()
    background.name = "background"
    scene.add(background)

    middle = createMiddleGeometry()
    middle.name = "middle"
    scene.add(middle)

    innerGeometry = createInnerGeometry()
    innerGeometry.name = "inner"
    scene.add(innerGeometry)

    innerGeometry.position.x -= 0.2
    innerGeometry.scale.set(1.2, 1.2)

    addPostProcessing()
    addEvents()

    clock.start()

    onResize()
    animate()
  }

  /**
   * Post init, callback after
   */
  function addPostProcessing() {
    composer = track(new EffectComposer(renderer))
    composer.addPass(track(new RenderPass(scene, camera)))

    const effect = track(new ShaderPass(Noise))
    composer.addPass(effect)
  }

  /**
   * The render animate loop
   */
  function animate() {
    const { w, h } = getSizes()
    let multiplier = 0.04

    requestAnimationFrame(animate)

    // innerGeometry.position.y = (($coords.y / window.innerHeight) * multiplier) + (multiplier / 2)
    innerGeometry.position.y = ($coords.y / h - 0.5) * 0.05 + 0.1
    if (w > 640) {
      innerGeometry.position.x =
        -0.5 + (Math.sin($coords.x / window.innerWidth) - 0.5) * 0.05
    } else {
      const pos = Math.sin(progress * Math.PI) / 2 - 0.5
      const rangedPos = range(-0.5, 0, -0.5, -0.3, pos)
      innerGeometry.position.x = rangedPos
    }

    innerGeometry.visible = false
    middleGeometry.visible = false
    cubeCamera.update(renderer, scene)
    middleGeometry.visible = true
    innerGeometry.visible = true
    composer.render(scene, camera)

    uniforms.u_time.value += clock.getDelta()
    cubeMaterial.uniforms.tCube.value = cubeRenderTarget.texture
  }

  /**
   * Set up the Scene
   */
  function createScene() {
    const { w, h } = getSizes()

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 10)
    camera.position.z = 1.3
  }

  /**
   * Set up the renderer
   */
  function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialiasing: true })
    container.appendChild(renderer.domElement)
  }

  /**
   * Create render targets
   */
  function createRenderTargets() {
    cubeRenderTarget = track(
      new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipMapLinearFilter,
        encoding: THREE.sRGBEncoding,
      })
    )

    cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)
  }

  /**
   * Geometries
   */
  function createMiddleGeometry() {
    const middleMesh = track(new THREE.SphereGeometry(2.9, 20, 20))
    const bgMaterial = track(new TransparencyMaterial({ uniforms }))

    middleGeometry = track(new THREE.Mesh(middleMesh, bgMaterial))

    return middleGeometry
  }

  function createBackground() {
    uniforms = {
      u_patternScale: { type: "f", value: patternScale },
      u_patternBias1: { type: "f", value: patternBias1 },
      u_patternBias2: { type: "f", value: patternBias2 },
      u_velocity: { type: "f", value: 0 },
      background: { type: "v3", value: backgroundColor },
      u_backgroundColor: { type: "v3", value: backgroundColor },
      u_firstColor: { type: "v3", value: color1 },
      u_secondColor: { type: "v3", value: color2 },
      u_accentColor: { type: "v3", value: color3 },
      u_resolution: { type: "v2", value: new THREE.Vector2() },
      u_mouse: { type: "v3", value: new THREE.Vector3() },
      u_time: { type: "f", value: 2000 },
    }

    innerUniforms = {
      tCube: { type: "sampler2D", value: null },
      u_RefractionRatio: { type: "f", value: 0.02 },
      u_FresnelBias: { type: "f", value: 0.5 },
      u_FresnelScale: { type: "f", value: 0.1 },
      u_FresnelPower: { type: "f", value: 1.0 },
      u_time: { type: "f", value: 2000 },
    }

    const mesh = track(new THREE.SphereGeometry(3.0, 20, 20))
    const bgMaterial = track(new MonoPoleMaterial({ uniforms }))
    bgGeometry = track(new THREE.Mesh(mesh, bgMaterial))
    bgGeometry.material.transparent = true

    return bgGeometry
  }

  // Create
  function createInnerGeometry() {
    const innerGeometry = track(new THREE.IcosahedronGeometry(0.35, 20))
    cubeMaterial = track(
      new RefractionReflectionMaterial({ uniforms: innerUniforms })
    )
    return track(new THREE.Mesh(innerGeometry, cubeMaterial))
  }

  /**
   * Events
   */
  function addEvents() {
    if ("ontouchmove" in window) {
      window.addEventListener("touchstart", handleMouseDown)
      window.addEventListener("touchmove", handleMouseMove)
      window.addEventListener("touchend", handleMouseUp)
    } else {
      window.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
  }

  function handleMouseDown(e) {
    pointerDown = true
    pointer.x = e.touches ? e.touches[0].clientX : e.clientX
  }

  function handleMouseMove(e) {
    if (!pointerDown) return

    const x = e.touches ? e.touches[0].clientX : e.clientX
    uniforms.u_velocity += (x - pointer.x) * 0.001

    pointer.x = x
  }

  function handleWindowMouseMove(e) {
    const { w } = getSizes()
    // if the mouse is on the right, make the intensity higher.
    const intensity = 1.6 + e.pageX / w
    coords.set({
      x: $coords.x + (e.pageX / 10) * intensity,
      y: e.clientY * intensity,
      z: $coords.z,
    })
  }

  function handleMouseUp() {
    pointerDown = false
  }

  function onResize(e) {
    const { w, h } = getSizes()

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    uniforms.u_resolution.value.x = w
    uniforms.u_resolution.value.y = h

    renderer.setSize(w, h)
    composer.setSize(w, h)

    renderer.domElement.setAttribute("width", w)
    renderer.domElement.setAttribute("height", h)
  }

  /**
   * Reactive statements
   */
  $: {
    if (uniforms) {
      uniforms.u_mouse.value.x = $coords.x
      uniforms.u_mouse.value.y = $coords.y
      uniforms.u_mouse.value.z = $coords.z
    }
  }

  $: {
    if (c1) {
      if (uniforms) {
        uniforms.u_firstColor.value = new THREE.Color(c1)
        uniforms.u_secondColor.value = new THREE.Color(c2)
        uniforms.u_accentColor.value = new THREE.Color(c3)
      }
    }
  }

  $: dark = $y < 200

  /**
   * Utility functions
   */
  function onScroll(e) {
    const z = window.scrollY
  }

  /**
   * Lifecycles
   */
  preInit()

  onMount(async () => {
    data = await getData()
    await init()
  })

  onDestroy(() => {
    tracker.dispose()
  })
</script>

<!-- Events -->
<svelte:window
  on:scroll={onScroll}
  on:mousemove={handleWindowMouseMove}
  on:resize={onResize}
  on:orientationchange={onResize}
/>

<!-- Container -->
<div class:dark bind:this={container} />

<!-- Style -->
<style lang="postcss">
  .dark {
    @apply opacity-0;
  }
</style>
