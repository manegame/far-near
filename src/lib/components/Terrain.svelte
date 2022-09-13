<svelte:options tag="far-near-terrain" />

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
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
  import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js'
  import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';


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
        raycaster,
        texture,
        mesh

  /**
   * Variables 
   * with a default
   */
  const apiUrl = "https://far-near.media/wp-json/wp/v2/shop"

  let player = true
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
  

  const worldWidth = 150, worldDepth = 150;
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

    //addFloor()
    const data  = generateHeight( worldWidth, worldDepth );

    const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
    geometry.rotateX( - Math.PI / 2 );
    

    const vertices = geometry.attributes.position.array;

				for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

					vertices[ j + 1 ] = data[ i ] * 10;

				}
    
    texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;    


    var material = new THREE.MeshBasicMaterial({map: texture, /*wireframe: true*/});


    mesh = new THREE.Mesh( geometry, material);
		scene.add( mesh );
    mesh.position.y = -1000;


  

    


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

    const delta = clock.getDelta()

    if (player) {
      controls.update(delta)
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
    //scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

		camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 5000);
		camera.position.z = 1.3;
	}

  /**
   * Add controls
  */
  function addControls () {
    if (player === false) {
      controls = new OrbitControls( camera, renderer.domElement );
    } else {
      controls = new FirstPersonControls( camera, renderer.domElement );
      controls.movementSpeed = 150;
      controls.lookSpeed = 0.1;
    }


    // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    // controls.dampingFactor = 0.05;
    // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 )

    // scene.add( controls.getObject() )
  }

  /**
   * Add sphere in the middle of the scene
  */
  function addSphere () {
    sphere = sampleGeometryFunction()
    sphere.name = 'Sphere'
    scene.add(sphere)
  }

  function generateHeight( width, height ) {

      let seed = Math.PI / 4;
      window.Math.random = function () {

        const x = Math.sin( seed ++ ) * 10000;
        return x - Math.floor( x );

      };

      const size = width * height, data = new Uint8Array( size );
      const perlin = new ImprovedNoise(), z = Math.random() * 100;

      let quality = 1;

      for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

          const x = i % width, y = ~ ~ ( i / width );
          data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

      }

      return data;

}


function generateTexture( data, width, height ) {

        let context, image, imageData, shade;

        const vector3 = new THREE.Vector3( 0, 0, 0 );

        const sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();

        const canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext( '2d' );
        context.fillStyle = '#000';
        context.fillRect( 0, 0, width, height );

        image = context.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;

        for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

          vector3.x = data[ j - 2 ] - data[ j + 2 ];
          vector3.y = 2;
          vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
          vector3.normalize();

          shade = vector3.dot( sun );

          imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 1 ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 2 ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );

        }

          context.putImageData( image, 0, 0 );

          // Scaled 4x

          const canvasScaled = document.createElement( 'canvas' );
          canvasScaled.width = width *1;
          canvasScaled.height = height *1;

          context = canvasScaled.getContext( '2d' );
          context.scale( 4, 4 );
          context.drawImage( canvas, 0, 0 );

          image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
          imageData = image.data;

          for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

            const v = ~ ~ ( Math.random() * 5 );

            imageData[ i ] += v;
            imageData[ i + 1 ] += v;
            imageData[ i + 2 ] += v;

          }
          context.putImageData( image, 0, 0 );

          return canvasScaled;

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

      case 'Space':
        console.log(canJump)
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

    if (player) {
      controls.handleResize();
    }
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