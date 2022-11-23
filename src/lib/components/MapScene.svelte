<script>
  /**
   * Base Scene
   * A scene with postprocessing effects, effective cleanup etc.
   * v0.0.1-manegame
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

  // Svelte
	import { onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';

  // Stores
  import { data } from "$lib/stores"

  /**
   * Props
   */

  /**
   * Variables
   * Will be set in later functions
   */
   let  renderer,
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
        coords

  /**
   * Variables 
   * with a default
   */
  let pointerDown = false
  
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

    // Here we start adding the scene's geometries
    sphere = sampleGeometryFunction()
    sphere.name = 'Sphere'
    scene.add(sphere)

    addPostProcessing()
		addEvents()

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
		requestAnimationFrame(animate);

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

		camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 10);
		camera.position.z = 1.3;
	}

  /**
   * Add controls
  */
  function addControls () {
    // 
  }

  /**
   * Create render targets
   */
   function createRenderTargets () {
    // cubeRenderTarget = track(new THREE.WebGLCubeRenderTarget(256, {
    //    format: THREE.RGBAFormat,
    //    generateMipmaps: true,
    //    minFilter: THREE.LinearMipMapLinearFilter,
    //    encoding: THREE.sRGBEncoding
    //  }))
 
    // cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)
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
    const mesh = track(new THREE.SphereGeometry(0.1, 20, 20));
    // https://threejs.org/docs/scenes/material-browser.html#MeshStandardMaterial
    const material = track(new THREE.MeshStandardMaterial({
      color: 0x0ff,
      transparent: true,
      opacity: 0.9
    }));
    
    const geometry = track(new THREE.Mesh(mesh, material))

    return geometry
  }

	/**
	 * Events
	 */

  //  Add all events
	function addEvents() {
		if ('ontouchmove' in window) {
			window.addEventListener('touchstart', handleMouseDown);
			window.addEventListener('touchmove', handleMouseMove);
			window.addEventListener('touchend', handleMouseUp);
		} else {
			window.addEventListener('mousedown', handleMouseDown);
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}
	}

  // Mouse down
	function handleMouseDown(e) {
		pointerDown = true;
		pointer.x = e.touches ? e.touches[0].clientX : e.clientX;
	}

  // Mouse up
	function handleMouseUp() {
		pointerDown = false;
	}

  // Mouse move on the scene
	function handleMouseMove(e) {
		if (!pointerDown) return;

		const x = e.touches ? e.touches[0].clientX : e.clientX;

    if (uniforms) {
      uniforms.u_velocity += (x - pointer.x) * 0.001;
    }

		pointer.x = x;
	}

  // Mouse move
	function handleWindowMouseMove(e) {
    const { w } = getSizes()
    // if the mouse is on the right, make the intensity higher.
    const intensity = 1.6 + e.pageX / w
		coords.set({ x: $coords.x + ((e.pageX) / 10) * intensity, y: e.clientY * intensity, z: $coords.z });
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
		await init();
	});

  onDestroy(() => {
    tracker.dispose()
  })
</script>

<!-- Events -->
<svelte:window
  on:scroll={onScroll}
	on:mousemove={handleWindowMouseMove}
	on:resize={handleResize}
	on:orientationchange={handleResize}
/>

<!-- Container -->
<div bind:this={container} />
