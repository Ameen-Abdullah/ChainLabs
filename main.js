import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import { EffectComposer, OrbitControls } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EventBus from "./utils/EventBus";
import WebGL from "./modules/WebGL";
import { ShaderPass } from 'three/examples/jsm/Addons.js';


window.EventBus = EventBus;

gsap.registerPlugin(ScrollTrigger);

if (!window.isDev) window.isDev = false;

const webglMng = new WebGL({
  $wrapper: document.body,
});


let fluidCanvas = new THREE.CanvasTexture(document.querySelector("canvas.fluid"));




// const fluidTexture = new THREE.Texture(fluidCanvas);
// fluidTexture.minFilter = THREE.LinearFilter;
// fluidTexture.magFilter = THREE.LinearFilter;
// fluidTexture.format = THREE.RGBAFormat;


let scene, camera, renderer, width, height;

//geometry       
let geometry, controls;

//meshes

let mesh;

//materials
let material;

width = window.innerWidth;
height = window.innerHeight;

// init

camera = new THREE.PerspectiveCamera(20, width / height, 0.01, 10);
camera.position.z = 2;

scene = new THREE.Scene();

geometry = new THREE.PlaneGeometry(0.4, 0.4, 10, 10);
material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    time: { value: 0 },
    fluidTexture: { value: fluidCanvas }
  }
})

mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.querySelector("canvas.threejs") });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);


renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .6;



//
// controls = new OrbitControls(camera,renderer.domElement);
// controls.enableDamping = true;
// controls.enableZoom = false;
// controls.enablePan = false;



//post processing 


// Create the EffectComposer
const composer = new EffectComposer(renderer);

// Add a RenderPass for the entire scene
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const customPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    tFluid: { value: fluidCanvas },

  },
  vertexShader: vertex,
  fragmentShader: fragment,
});

composer.addPass(customPass);

// Create the UnrealBloomPass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3, // strength
  0.2, // radius
  0.9 // threshold
);
composer.addPass(bloomPass);
//lights


let hrdis = [
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_01_1k.hdr",
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_04_1k.hdr",
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_07_1k.hdr",
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_07_1k.hdr",
  "",
]


let hdri = new RGBELoader().load(hrdis[0], function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.environment = texture;
  // scene.background = texture; // Adding background for more realism

  // Adjusting the intensity of the HDR
  texture.encoding = THREE.sRGBEncoding;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.anisotropy = 1;
  texture.format = THREE.RGBAFormat;

  const ambientLight = new THREE.AmbientLight("#B6D8FE", 0.3); // Decreased intensity
  // scene.add(ambientLight);

  // Adding directional light for shadows and highlights
  const directionalLight = new THREE.DirectionalLight("#B6D8FE", 2); // Decreased intensity
  directionalLight.position.set(0, 3, 7.5);

  const directionalLight2 = new THREE.DirectionalLight("#0867C0", 1); // Decreased intensity
  directionalLight2.position.set(0, 1, 0);
  scene.add(directionalLight2);


  const plight = new THREE.PointLight("#0867C0", 2);
  plight.position.set(0, -.2, -0.3);

  scene.add(directionalLight, directionalLight2, plight);
  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2, .1);

  // scene.add(directionalLightHelper,directionalLightHelper2);
});

const draco = new DRACOLoader()
draco.setDecoderPath('/draco/');

const loader = new GLTFLoader()
loader.setDRACOLoader(draco);

let circleNode, iceCubeNode, FloatingCubeNode;

let group = new THREE.Group();
scene.add(group);

let textureLoader = new THREE.TextureLoader();

let image = textureLoader.load('/h1.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
});

loader.load(
  // '/chainBaked.glb',
  '/chainlabs.glb',

  function (gltf) {
    group.add(gltf.scene);

    group.position.y = -1.55;

    gltf.scene.traverse((child) => {

      if (child.isMesh && child.name === 'Circle') {
        circleNode = child;

        let material = new THREE.MeshBasicMaterial({
          color: "#D1E7FC",
        });
        // child.material = material;
      }

      if (child.isMesh && child.name === 'Cube001') {

        let material = new THREE.MeshBasicMaterial({
          color: "#D1E7FC",
        });
        child.material = material;
      }

      if (child.isMesh && child.name === 'Cube') {
        iceCubeNode = child;
        // child.material.roughness = 1
      }

      if (child.isMesh && child.name === 'Plane') {
        child.material.roughness = 1;
        // child.material.metalness = .5;

        let material = new THREE.MeshStandardMaterial({
          // color: "#0e20e0e",
          color: "#777777",
          map: image
        });
        child.material = material;

        let s = 1.;
      }

      if (child.isMesh && child.name === 'CC_Base_Body') {
        child.material.roughness = .9;
      }


      if (child.isMesh && child.name === 'Cube065') {
        FloatingCubeNode = child;
        child.position.x = .3;
        child.position.z = -0.5;
      }
    })

    // console.log(gltf);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
)


let mouseX = 0, mouseY = 0;
const targetX = 0, targetY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});




// gsap animation

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '#main',
    start: 'top top',
    end: '600vh',
    scrub: true,
    pin: true,
    markers: true,
  }
});

tl.to(camera.rotation, {
  duration: 3,
  y: 1.57,
  ease: "power1.out",
});


function animate(time) {
  // controls.update();
  fluidCanvas.needsUpdate = true;
  // fluidTexture.needsUpdate = true;
  material.uniforms.time.value = time / 1000;
  customPass.uniforms.tFluid.value = fluidCanvas;

  // customPass.uniforms.tDiffuse.value = fluidTexture;
  gsap.to(camera.position, {
    x: mouseX * .1,
    y: mouseY * .1,
    duration: 1
  })

  camera.lookAt(scene.position);

  if (circleNode) {
    circleNode.rotation.y += 0.001;
  }
  if (iceCubeNode) {
    iceCubeNode.rotation.x = 325 + time * .001;
    iceCubeNode.rotation.y = 225 + time * .001;
  }

  if (FloatingCubeNode) {
    FloatingCubeNode.position.y = Math.sin(time * .001) * .01 + 1.5;
    // FloatingCubeNode.rotation.y = Math.sin(time * .001) * .01;
    // FloatingCubeNode.rotation.z = Math.sin(time * .001) * .01;
    // FloatingCubeNode.rotation.x = Math.sin(time * .001) * .01;
  }

  renderer.render(scene, camera);
  composer.render();
}
