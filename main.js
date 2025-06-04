import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;
camera.position.y = 4;
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const scene = new THREE.Scene();

// skybox
const cubeLoader = new THREE.CubeTextureLoader();
scene.background = cubeLoader.load([
  'textures/pos-x.jpg',
  'textures/neg-x.jpg',
  'textures/pos-y.jpg',
  'textures/neg-y.jpg',
  'textures/pos-z.jpg',
  'textures/neg-z.jpg',
]);

// lights
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(-1, 2, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffddaa, 1.2, 20);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);


const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

const loadManager = new THREE.LoadingManager();
loadManager.onLoad = () => loadingElem.style.display = 'none';
loadManager.onProgress = (url, loaded, total) => {
  progressBarElem.style.transform = `scaleX(${loaded / total})`;
};

const textureLoader = new THREE.TextureLoader(loadManager);

// pool table
const tableTex = textureLoader.load('textures/pool_table_felt.jpg');
tableTex.colorSpace = THREE.SRGBColorSpace;

const poolTable = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.5, 5),
  new THREE.MeshStandardMaterial({ map: tableTex })
);
poolTable.position.set(0, -1, 0);
scene.add(poolTable);

const legGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
const legOffsets = [
  [-4.5, -2, -2.2],
  [4.5, -2, -2.2],
  [-4.5, -2, 2.2],
  [4.5, -2, 2.2],
];

legOffsets.forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(legGeometry, legMaterial);
  leg.position.set(x, y, z);
  scene.add(leg);
});

// pool balls
function createPoolBall(path, x, z) {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), mat);
  ball.position.set(x, -0.35, z);
  scene.add(ball);
}


const ballTextures = [
  'ball-1.jpg', 'ball-2.jpg', 'ball-3.jpg', 'ball-4.jpg', 'ball-5.jpg',
  'ball-6.jpg', 'ball-7.jpg', 'ball-8.jpg', 'ball-9.jpg', 'ball-10.jpg',
  'ball-11.jpg', 'ball-12.jpg', 'ball-13.jpg', 'ball-14.jpg', 'ball-15.jpg'
];

let currentBall = 0;
const spacing = 0.6;
const startX = -1.5;
const startZ = 0.5;

for (let row = 0; row < 5; row++) {
  const ballsInRow = row + 1;
  const offsetX = startX - (ballsInRow - 1) * spacing / 2;

  for (let col = 0; col < ballsInRow; col++) {
    if (currentBall >= ballTextures.length) break;

    const originalX = offsetX + col * spacing;
    const originalZ = startZ + row * spacing;
    const x =-originalZ-1.3;
    const z = -originalX-1.5;

    createPoolBall(`textures/${ballTextures[currentBall]}`, x, z);
    currentBall++;
  }
}


// cue stick
const cue = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.1, 6, 32),
  new THREE.MeshStandardMaterial({ color: 0x8B4513 })
);
cue.rotation.z = Math.PI / 1.99;
cue.position.set(5, -0.5, 0);
scene.add(cue);

// chalk cube
const chalkTex = textureLoader.load('textures/chalk.jpg');
chalkTex.colorSpace = THREE.SRGBColorSpace;
const chalk = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ map: chalkTex })
);
chalk.position.set(4, -0.5, -1.5);
scene.add(chalk);

// fly model
const gltfLoader = new GLTFLoader(loadManager);
gltfLoader.load(
  'models/Fly.glb',
  (gltf) => {
    const fly = gltf.scene;
    fly.scale.set(0.5, 0.5, 0.5);
    fly.position.set(8.5, 0, 0);
    fly.rotation.y = Math.PI / 9;
    scene.add(fly);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// cueball
const cueBallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cueBall = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), cueBallMaterial);
cueBall.position.set(1.5, -0.35, 0);
scene.add(cueBall);

// table border
const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033 });

const borderThickness = 0.3;
const borderHeight = 0.3;
const tableWidth = 10;
const tableDepth = 5;

// left
const borderLeft = new THREE.Mesh(
  new THREE.BoxGeometry(borderThickness, borderHeight, tableDepth + borderThickness * 2),
  borderMaterial
);
borderLeft.position.set(-tableWidth / 2 - borderThickness / 2, -0.7, 0);
scene.add(borderLeft);

// right
const borderRight = new THREE.Mesh(
  new THREE.BoxGeometry(borderThickness, borderHeight, tableDepth + borderThickness * 2),
  borderMaterial
);
borderRight.position.set(tableWidth / 2 + borderThickness / 2, -0.7, 0);
scene.add(borderRight);

// front
const borderFront = new THREE.Mesh(
  new THREE.BoxGeometry(tableWidth, borderHeight, borderThickness),
  borderMaterial
);
borderFront.position.set(0, -0.7, -tableDepth / 2 - borderThickness / 2);
scene.add(borderFront);

// back
const borderBack = new THREE.Mesh(
  new THREE.BoxGeometry(tableWidth, borderHeight, borderThickness),
  borderMaterial
);
borderBack.position.set(0, -0.7, tableDepth / 2 + borderThickness / 2);
scene.add(borderBack);

// pockets
const pocketMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const pocketRadius = 0.25;
const pocketGeo = new THREE.SphereGeometry(pocketRadius, 16, 16);

const pocketPositions = [
  // corners
  [-5, -0.55, -2.5],
  [ 5, -0.55, -2.5],
  [-5, -0.55,  2.5],
  [ 5, -0.55,  2.5],
  // middles
  [ 0, -0.55, -2.5],
  [ 0, -0.55,  2.5],
];

pocketPositions.forEach(([x, y, z]) => {
  const pocket = new THREE.Mesh(pocketGeo, pocketMaterial);
  pocket.position.set(x, y-0.11, z);
  scene.add(pocket);
});

function render(time) {
  time *= 0.001;
  chalk.rotation.y = time;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
