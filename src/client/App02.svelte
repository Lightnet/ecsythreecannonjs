<script>
  //https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
  import { onMount, onDestroy, createEventDispatcher} from 'svelte';
  import { generateId } from './generateid';
  import "../common/cannon.js";
  //import { gun, onLogin } from './mjs';

  let idcomponent = "main-" + generateId();
  let elcomponent;
  let idnav = "nav-" + generateId();
  let elnav;
  let idcontent = "content-" + generateId();
  let elcontent;
  let navheight = 22;

  let scene;
  let camera;
  let renderer;
  let cube;
  let clock = new THREE.Clock();
  let world;

  let rigidBodies = [], tmpTrans;

  function handle_auto_resize(event){
    //if(elcomponent == null){
      //return;
    //}
    //console.log("resize");
    let parent = elcomponent.parentNode;
    elcomponent.style.height = parent.clientHeight + 'px';
    elcomponent.style.width = parent.clientWidth + 'px';

    elnav.style.height = navheight + 'px';
    elnav.style.width = parent.clientWidth + 'px';

    elcontent.style.height = (parent.clientHeight - navheight) + 'px';
    elcontent.style.width = parent.clientWidth + 'px';

    renderer.setSize( window.innerWidth, (window.innerHeight - 22) );
  }

  onMount(() => {
    console.log(CANNON)
    elcomponent = document.getElementById(idcomponent);
    elnav = document.getElementById(idnav);
    elcontent = document.getElementById(idcontent);
    initScene();
    initPhysics();
    handle_auto_resize();
    window.addEventListener('resize', handle_auto_resize);
    window.dispatchEvent(new Event('resize'));
  });
  //https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
  function initPhysics(){
    //Ammo().then( startPhysics )
    startPhysics();
  }

  function startPhysics(){
    setupPhysicsWorld();
  }

  let physicsWorld;

  let sphereBody;
  let N = 1;
  let meshes = [];
  let bodies = [];
  let cubeMesh, boxShape, boxBody;

  function setupPhysicsWorld(){
    world = new CANNON.World();
    //world.gravity.set(0, 0, -9.82); // m/s²
    world.gravity.set(0, -9.82, 0); // m/s²

    // floor
    let geometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
    //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
    let material = new THREE.MeshLambertMaterial( { color: 0x777777 } );
    let markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    //THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
    let mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI / 2);
    mesh.receiveShadow = true;
    scene.add(mesh);

    // cubes
    var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    for(var i=0; i<N; i++){
      cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
      cubeMesh.castShadow = true;
      meshes.push(cubeMesh);
      scene.add(cubeMesh);
    }

    // Create boxes
    var mass = 5, radius = 1.3;
    boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    for(var i=0; i<N; i++){
      boxBody = new CANNON.Body({ mass: mass });
      boxBody.addShape(boxShape);
      boxBody.position.set(0,5,0);
      world.add(boxBody);
      bodies.push(boxBody);
    }

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);

  }

  function initScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 22), 0.1, 1000 );
    //camera.position.set( 0, 30, 70 );
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.position.set(10, 2, 0);
    camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
    renderer = new THREE.WebGLRenderer({ antialias: true } );
    renderer.setSize( window.innerWidth, (window.innerHeight - 22) );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    //document.body.appendChild( renderer.domElement );
    var container = document.getElementById( 'viewport' );
    container.appendChild( renderer.domElement );

    //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    //cube = new THREE.Mesh( geometry, material );
    //scene.add( cube );

    //camera.position.z = 5;
    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    animate();
  }

  function animate() {
    let deltaTime = clock.getDelta();
    updatePhysics( deltaTime )

    requestAnimationFrame( animate );
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    renderer.render( scene, camera );
  };
  let fixedTimeStep = 1.0 / 60.0; // seconds
  let maxSubSteps = 3;
  function updatePhysics( deltaTime ){
    if(world !=null){
      world.step(fixedTimeStep, deltaTime, maxSubSteps);
      for(var i=0; i !== meshes.length; i++){
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
      }
      //console.log("Sphere z position: " + sphereBody.position.z);
    }
  }

  onDestroy(()=>{
    window.removeEventListener('resize', handle_auto_resize);
    unsubLogin();
  });
  
</script>
<style>
  .mainbody{
    width:100%;
    height:100%;
  }
</style>

<div id="{idcomponent}" class="mainbody">
    <div id={idnav} class="navmenu">

    </div>
    <div id={idcontent} class="content">
      <div id="viewport" class="topleft" style="width:100%;height:100%;"></div>
    </div>
</div>