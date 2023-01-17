<svelte:options tag="far-near-pointer-lock" />

<script>
  /**
   * FAR NEAR – navigate through a 3D world
   * 
   * Notes to self:
   * 
   * https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
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
  import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

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

  let pointerDown = false
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = false;
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

    requestAnimationFrame( animate );

    const time = performance.now();

    if (controls.isLocked) {
      raycaster.ray.origin.copy( controls.getObject().position );
      raycaster.ray.origin.y -= 10;
  
      const intersections = raycaster.intersectObjects( objects, false );
  
      const onObject = intersections.length > 0;
  
      const delta = ( time - prevTime ) / 1000;
  
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
  
      
      velocity.y -= 1.2 * 1.0 * delta; // 100.0 = mass
      
      direction.z = Number( moveForward ) - Number( moveBackward );
      direction.x = Number( moveRight ) - Number( moveLeft );
      direction.normalize(); // this ensures consistent movements in all directions
  
      if ( moveForward || moveBackward ) velocity.z -= direction.z * 4.0 * delta;
      if ( moveLeft || moveRight ) velocity.x -= direction.x * 4.0 * delta;
  
      controls.moveRight( - velocity.x * delta );
      controls.moveForward( - velocity.z * delta );
  
      controls.getObject().position.y += ( velocity.y * delta ); // new behavior
  
      if ( controls.getObject().position.y < 10 ) {
  
        velocity.y = 0;
        controls.getObject().position.y = 0;
  
        canJump = true;
  
      }
  
      prevTime = time
  
      // requestAnimationFrame(animate);

    }  
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
    controls = new PointerLockControls( camera, document.body );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 )

    scene.add( controls.getObject() )
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
    const mesh = track(new THREE.SphereGeometry(0.1, 20, 20));
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
      console.error(error)
    }
  }

  /**
   * Play the scene
  */
 function play () {
    controls.lock()
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

  function handleKeyDown ({ code }) {
    switch ( code ) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'Shift':
        if ( canJump === true ) {
          velocity.y += 1000
        }
        canJump = false;
        break;
    }
  }

  function handleKeyUp ({ code }) {
    switch ( code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  };


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
	on:mousemove={handleWindowMouseMove}
	on:resize={handleResize}
	on:orientationchange={handleResize}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
/>

{#if controls}
  {#if controls.isLocked === false}
    <div class="fn-instructions" on:click={play}>
      <!-- ClllLick toO PlayyYAYyyy -->
    </div>
  {/if}
{/if}

<!-- Container -->
<div bind:this={container} />

<style lang="postcss">
  .fn-instructions {
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