<svelte:options tag="far-near-terrain" />

<script>
  /**
   * FAR NEAR – navigate through a 3D world
   * 
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
  import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
  import { generateHeight, generateTexture } from '$lib/threejs/terrain'

  // Developer things
  import { GUI } from 'dat.gui'


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
  
  /**
   * Controllable from the GUI
   */
  let player = { firstPerson: false }
  let cameraOptions = {
    near: 1,
    far: 35000
  }
  let terrainOptions = {
    width: 20, // inactive
    height: 150
  }
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

    //we have to rotate otherwise the terrain is vertically oriented
    geometry.rotateX( - Math.PI / 2 );
    

    const vertices = geometry.attributes.position.array;

				for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
					vertices[ j + 1 ] = data[ i ] * 10;
				}
    
    texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;


    var material = new THREE.MeshPhongMaterial({map: texture /*wireframe: true*/});



    mesh = new THREE.Mesh( geometry, material);
		scene.add( mesh );

    //change the position of the terrain so it's under the camera Y pos
    mesh.position.y = -200;
    addTerrain()

    addSphere()

    addPostProcessing()
		addEvents()

		clock.start()

    handleResize ();

    if (import.meta.env.DEV) {
      addGUI()
    }

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

    if (player.firstPerson) {
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
    scene.fog = new THREE.Fog( 0xffffff, 0, 3000 );

		camera = new THREE.PerspectiveCamera(35, w / h, cameraOptions.near, cameraOptions.far);
		camera.position.z = 1.3;
	}

  /**
   * Add controls
  */
  function addControls () {
    if (player.firstPerson === false) {
      controls = new OrbitControls( camera, renderer.domElement );
    } else {
      controls = new FirstPersonControls( camera, renderer.domElement );
      controls.movementSpeed = 150;
      controls.lookSpeed = 0.1;
    }
  }

  /**
   * Generate the terrain
  */
  function addTerrain () {
    const data  = generateHeight( terrainOptions.width, terrainOptions.height );
    
    const geometry = track(new THREE.PlaneGeometry( 7500, 7500, terrainOptions.width - 1, terrainOptions.height - 1 ));
    geometry.rotateX( - Math.PI / 2 );
    
    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
      vertices[j + 1] = data[ i ] * 10
    }
    
    texture = track(new THREE.CanvasTexture( generateTexture( data, terrainOptions.width, terrainOptions.height ) ))
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping

    var material = track(new THREE.MeshBasicMaterial({ map: texture, /*wireframe: true*/ }))

    mesh = track(new THREE.Mesh( geometry, material))
    mesh.position.y = -1000
    mesh.name = 'Terrain'
    scene.add( mesh )
  }

  /**
   * Add a floor to walk on
   */
  /*function addFloor () {
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
  }*/


  // generate the heightmap using ImprovedNoise addon
  function generateHeight( width, height ) {

      let seed = Math.PI / 4;
      window.Math.random = function () {

        const x = Math.sin( seed ++ ) * 10000;
        return x - Math.floor( x );

      };


      const size = width * height, data = new Uint8Array( size );
      const perlin = new ImprovedNoise(), z = Math.random() * 100;

      // The highest quality is, the less there is different volumes. example : if quality = 3, terrain look like a lot of little pic while if quality = 100, the terrain look like dune
      let quality = 20;

      // j < 'maximum height value', change this to get higher or lower volumes
      for ( let j = 0; j < 1; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

          const x = i % width, y = ~ ~ ( i / width );
          data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 2 );

        }
        
        //multiply the number of polygons
        quality *= 3;

      }

      return data;

}


function generateTexture( data, width, height ) {

        let context, image, imageData, shade;

        const vector3 = new THREE.Vector3( 0, 0, 0 );

        //sun intensity
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

          // R G & B values
          imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 1 ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 2 ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );

        }

          context.putImageData( image, 0, 0 );

          // To multiply the scale of terrain, change the "*1" value

          const canvasScaled = document.createElement( 'canvas' );
          canvasScaled.width = width *5;
          canvasScaled.height = height *5;

          context = canvasScaled.getContext( '2d' );
          context.scale( 4, 4 );
          context.drawImage( canvas, 0, 0 );

          image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
          imageData = image.data;

          for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

            const v = ~ ~ ( Math.random() * 5);

            imageData[ i ] += v;
            imageData[ i + 1 ] += v;
            imageData[ i + 2 ] += v;

          }
          context.putImageData( image, 0, 0 );

          return canvasScaled;

}

  function updateTerrain () {
    const terrain = scene.getObjectByName('Terrain')
    terrain.geometry.dispose()
    terrain.material.dispose()
    scene.remove(terrain)
    addTerrain()
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
  function addSphere () {
    const mesh = track(new THREE.SphereGeometry(0.1, 20, 20));
    // https://threejs.org/docs/scenes/material-browser.html#MeshStandardMaterial
    const material = track(new THREE.MeshStandardMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.9
    }));
    
    const geometry = track(new THREE.Mesh(mesh, material))
    geometry.name = 'Sphere'

    scene.add(geometry)
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

    if (player.firstPerson) {
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
   * GUI
  */
  function addGUI () {
    const gui = new GUI()

    // Player
    const metaFolder = gui.addFolder('Player')
    const playerControlsController = metaFolder.add(player, 'firstPerson')
    playerControlsController.onChange(addControls)
    metaFolder.open()

    // Camera
    const cameraFolder = gui.addFolder('Camera')
    const nearController = cameraFolder.add(cameraOptions, 'near', 0.01, 1, 0.01)
    const farController = cameraFolder.add(cameraOptions, 'far', 101, 100000)

    // Terrain
    const terrainFolder = gui.addFolder('Terrain')
    // const terrainWidth = terrainFolder.add(terrainOptions, 'width', 2, 300)
    const terrainHeight = terrainFolder.add(terrainOptions, 'height', 2, 900)
    terrainFolder.open()

    // terrainWidth.onChange(updateTerrain)
    terrainHeight.onChange(updateTerrain)

    /**
     * Update things
    */
    nearController.onChange(e => {
      camera.near = e
      camera.updateProjectionMatrix()
    })
    farController.onChange(e => {
      camera.far = e
      camera.updateProjectionMatrix()
    })
    cameraFolder.open()
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