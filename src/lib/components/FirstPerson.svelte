<svelte:options tag="far-near-first-person" />

<script>
  /**
   * FAR NEAR – navigate through a 3D world in first person
   * 
   * Notes to self:
   * 
   * https://www.youtube.com/watch?v=oqKzxPMLWxo
   * 
  */



  /**
   * Imports
  */
  // THREE
	import * as THREE from 'three';
  import { ResourceTracker } from '$lib/threejs/ResourceTracker'
  import { EffectComposer } from '$lib/threejs/postprocessing/EffectComposer';
  import { RenderPass } from '$lib/threejs/postprocessing/RenderPass';
  import { ShaderPass } from '$lib/threejs/postprocessing/ShaderPass';
	import { Noise } from '$lib/threejs/shaders/noise';
  import { getSizes } from '$lib/threejs/utilities'
  import { FirstPersonControls } from "$lib/threejs/controls/FirstPersonControls"
  // import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';

  // Svelte
	import { onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';

  /**
   * Props
   */

  /**
   * Variables
   * Will be set in later functions
   */
   let  data,
        renderer,
        camera,
        scene,
        uniforms,
        container,
        sphere,
        composer,
        tracker,
        track,
        pointer,
        clock,
        coords,
        controls,
        raycaster

  /**
   * Variables 
   * with a default
   */
  const apiUrl = "https://far-near.media/wp-json/wp/v2/shop"

  let objects = []

  let prevTime = performance.now();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const color = new THREE.Color();
  
	/**
	 * Pre-Init: 
   * Runs before mount, use this to preset variables needed in init
	 */
  function preInit () {
    tracker = new ResourceTracker()
    track = tracker.track.bind(tracker);

	  pointer = {
      x: 0,
      y: 0
    }

	  clock = new THREE.Clock()

    coords = spring(
      { x: 0, y: 0, z: 0 },
      {
        stiffness: 0.01,
        damping: 0.2
      }
    )
  }

  /**
   * Init function
   */
	async function init() {
		createScene();

    addLights()

    createRenderer()
    // createRenderTargets()

    addControls()

    addFloor()

    addSphere()

    addPostProcessing()
		// addEvents()

		clock.start()

    handleResize ();
		animate();
	}

  /**
   * Post init, callback after 
   */
  function addPostProcessing () {
    composer = track(new EffectComposer(renderer))
    composer.addPass(track(new RenderPass(scene, camera)))

    const effect = track(new ShaderPass(Noise))
    composer.addPass(effect)
  }

	/**
	 * The render animate loop
	 */
	function animate() {

    requestAnimationFrame( animate );
    
    const delta = clock.getDelta()

    controls.update(delta)

		composer.render(scene, camera);
	}


	/**
	 * Set up the Scene
	 */
	function createScene() {
		const { w, h } = getSizes();

		scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff )
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

		camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 10000);
		camera.position.z = 1.3;
	}

  /**
   * Add controls
  */
  function addControls () {
    controls = new FirstPersonControls( camera, renderer.domElement ); // 

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 )
  }

  /**
   * Add sphere in the middle of the scene
  */
  function addSphere () {
    sphere = sampleGeometryFunction()
    sphere.name = 'Sphere'
    scene.add(sphere)
  }

  /**
   * Add a floor to walk on
   */
  function addFloor () {
    let floorGeometry = new THREE.PlaneGeometry( 200, 200, 10, 10 );
    floorGeometry.rotateX( - Math.PI / 2 );
    floorGeometry.translate(0, -1, 0);

  // vertex displacement
    let position = floorGeometry.attributes.position;

    for ( let i = 0, l = position.count; i < l; i ++ ) {
      vertex.fromBufferAttribute( position, i );

      vertex.x += Math.random() * .2 - .1;
      vertex.y += Math.random() * .2;
      vertex.z += Math.random() * .2 - .1;

      position.setXYZ( i, vertex.x, vertex.y, vertex.z );
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colorsFloor = [];

    for ( let i = 0, l = position.count; i < l; i ++ ) {
      color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      colorsFloor.push( color.r, color.g, color.b );
    }

    floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

    const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );

    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.name = 'Floor'
    // floor.position.x -= 1
    scene.add( floor );
  }

  /**
   * Add lights
  */
  function addLights () {
    const light = track(new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 ));
		light.position.set( 0.5, 1, 0.75 )

    scene.add(light)
  }

  /**
   * Set up the renderer
   */
  function createRenderer () {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		container.appendChild(renderer.domElement);
  }

  /**
   * Geometries
   */
  function sampleGeometryFunction () {
    const mesh = track(new THREE.SphereGeometry(10, 20, 20));
    // https://threejs.org/docs/scenes/material-browser.html#MeshStandardMaterial
    const material = track(new THREE.MeshStandardMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.9
    }));
    
    const geometry = track(new THREE.Mesh(mesh, material))

    return geometry
  }

  /**
   * Get data
   */
  async function getData () {
    try {
      const response = await fetch(apiUrl)
  
      data = await response.json()
    } catch (error) {
      
    }
  }


  /*
  * Resize
  */
  function handleResize (e) {
    const { w, h } = getSizes()

    camera.aspect = w / h
    camera.updateProjectionMatrix();

    if (uniforms) {
      uniforms.u_resolution.value.x = w;
      uniforms.u_resolution.value.y = h;
    }

    renderer.setSize(w, h);
    composer.setSize(w, h);

    renderer.domElement.setAttribute('width', w);
    renderer.domElement.setAttribute('height', h);

    controls.handleResize()
  }

	/**
	 * Reactive statements
	 */
	$: {
		if (uniforms) {
			uniforms.u_mouse.value.x = $coords.x;
			uniforms.u_mouse.value.y = $coords.y;
			uniforms.u_mouse.value.z = $coords.z;
		}
	}

	/**
	 * Utility functions
	 */
  function onScroll (e) {
    const z = window.scrollY
  }

	/**
	 * Lifecycles
	 */
  preInit()

	onMount(async () => {
    data = await getData()
		await init();
	});

  onDestroy(() => {
    tracker.dispose()
  })
</script>

<!-- Events -->
<svelte:window
  on:scroll={onScroll}
	on:resize={handleResize}
	on:orientationchange={handleResize}
/>

{#if controls}
  {#if controls.isLocked === false}
    <div class="instructions" on:click={play}>
      ClllLick toO PlayyYAYyyy
    </div>
  {/if}
{/if}

<!-- Container -->
<div bind:this={container} />

<style lang="postcss">
  .instructions {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: #0000ffcc;
    color: #fff;
    font-size: 48px ;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: opacity 0.4s ease;
  }
</style>