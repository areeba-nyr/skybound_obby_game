import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8edcff);
scene.fog = new THREE.Fog(0x8edcff, 35, 100);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x58729a, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(-8, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const mat = (color, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness });
const platformMat = mat(0x37d6a0);
const platformTopMat = mat(0x8cf5c8);
const lavaMat = new THREE.MeshStandardMaterial({ color: 0xff4d2e, emissive: 0xff2600, emissiveIntensity: 0.65 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd43b, emissive: 0x8a4b00, emissiveIntensity: 0.3 });
const platforms = [];
const hazards = [];
const coins = [];
const checkpoints = [];
let checkpoint = new THREE.Vector3(0, 1, 0);
let checkpointName = 'Start';
let coinCount = 0;
let won = false;

function block(x, y, z, w, h, d, material, target = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  target.add(mesh);
  return mesh;
}
function platform(x, y, z, w, d, color = 0x37d6a0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  scene.add(group);
  const body = block(0, -0.18, 0, w, 0.36, d, mat(color), group);
  block(0, 0.015, 0, w * 0.96, 0.07, d * 0.96, platformTopMat, group);
  platforms.push({ x, y, z, w, d, top: y + 0.07, mesh: body });
  return group;
}

// Floating course: the player starts at the near end and travels toward +Z.
platform(0, 0, 0, 7, 7, 0x2dbb91);
platform(0, 0.3, 7, 3.5, 3.5, 0x29b6cc);
platform(2.2, 0.65, 12, 3.2, 3.2, 0x7c6cf2);
platform(-0.8, 0.95, 17, 3.0, 3.0, 0xf472b6);
platform(-3, 1.25, 22, 3.0, 3.0, 0xfb923c);
platform(0, 1.55, 27, 3.0, 3.0, 0x38bdf8);
platform(3, 1.85, 32, 3.5, 3.5, 0xa3e635);
platform(3, 2.15, 38, 7, 7, 0xffc928);

// Lava below the course.
const lava = block(0, -3.3, 19, 42, 0.35, 60, lavaMat);
hazards.push({ x: 0, z: 19, w: 42, d: 60, y: -3.0 });

// Checkpoint platform marker
const cp = new THREE.Group();
cp.position.set(3, 2.2, 32);
scene.add(cp);
block(0, 0.5, 0, 0.18, 1.1, 0.18, mat(0xffffff), cp);
block(0.48, 0.85, 0, 0.9, 0.48, 0.08, mat(0xff4f87), cp);
checkpoints.push({ x: 3, z: 32, y: 2.92, name: 'Checkpoint 1' });

// Finish flag
const flag = new THREE.Group();
flag.position.set(3, 2.25, 39);
scene.add(flag);
block(0, 1.1, 0, 0.16, 2.2, 0.16, mat(0xffffff), flag);
block(0.6, 1.75, 0, 1.2, 0.7, 0.1, goldMat, flag);
block(0.6, 1.75, 0.06, 0.75, 0.12, 0.03, mat(0xfff7cc), flag);

// Simple low-poly clouds
for (let i = 0; i < 16; i++) {
  const cloud = new THREE.Group();
  const x = (Math.random() - 0.5) * 65;
  const y = 8 + Math.random() * 12;
  const z = Math.random() * 55 - 3;
  for (let j = 0; j < 4; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 10, 8), mat(0xffffff));
    puff.position.set(j * 0.8, Math.random() * 0.35, Math.random() * 0.4);
    cloud.add(puff);
  }
  cloud.position.set(x, y, z);
  scene.add(cloud);
}

// Player: colorful blocky character
const player = new THREE.Group();
scene.add(player);
const skinMat = mat(0xffc9a5);
const shirtMat = mat(0x6d5dfc);
const pantsMat = mat(0x253858);
const shoeMat = mat(0x202020);
block(0, 0.65, 0, 0.75, 0.8, 0.42, shirtMat, player);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), skinMat);
head.position.y = 1.32; head.castShadow = true; player.add(head);
block(-0.16, 1.36, 0.245, 0.06, 0.07, 0.025, mat(0x222222), player);
block(0.16, 1.36, 0.245, 0.06, 0.07, 0.025, mat(0x222222), player);
block(-0.22, 0.12, 0, 0.24, 0.35, 0.3, pantsMat, player);
block(0.22, 0.12, 0, 0.24, 0.35, 0.3, pantsMat, player);
block(-0.22, -0.05, 0.06, 0.25, 0.12, 0.38, shoeMat, player);
block(0.22, -0.05, 0.06, 0.25, 0.12, 0.38, shoeMat, player);

const playerRadius = 0.34;
const keys = {};
let verticalVelocity = 0;
let grounded = false;
let yaw = 0;
let cameraYaw = 0;
let cameraPitch = 0.22;
let dragging = false;
let lastMouseX = 0, lastMouseY = 0;
let jumpQueued = false;
const coinsUI = document.getElementById('coins');
const checkpointUI = document.getElementById('checkpoint');
const message = document.getElementById('message');
const overlay = document.getElementById('overlay');

function makeCoin(x, y, z) {
  const coin = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.11, 10, 18), goldMat);
  coin.position.set(x, y, z);
  coin.rotation.x = Math.PI / 2;
  coin.castShadow = true;
  scene.add(coin);
  coins.push({ mesh: coin, x, y, z, collected: false });
}
makeCoin(0, 1.35, 4.8);
makeCoin(2.2, 1.95, 11.7);
makeCoin(-0.8, 2.25, 16.7);
makeCoin(-3, 2.55, 21.7);
makeCoin(0, 2.85, 26.7);
makeCoin(3, 3.15, 31.7);
document.getElementById('totalCoins').textContent = String(coins.length);

function respawn() {
  player.position.copy(checkpoint);
  verticalVelocity = 0;
  grounded = false;
  message.textContent = 'Try again! Keep jumping!';
  setTimeout(() => { if (!won) message.textContent = 'Reach the golden finish platform!'; }, 1400);
}
function resetGame() {
  coinCount = 0; won = false;
  for (const c of coins) { c.collected = false; c.mesh.visible = true; }
  coinsUI.textContent = '0';
  checkpoint = new THREE.Vector3(0, 1, 0);
  checkpointName = 'Start';
  checkpointUI.textContent = checkpointName;
  overlay.style.display = 'none';
  message.textContent = 'Reach the golden finish platform!';
  respawn();
}
function setCheckpoint(cpData) {
  if (checkpointName === cpData.name) return;
  checkpoint.set(cpData.x, cpData.y, cpData.z);
  checkpointName = cpData.name;
  checkpointUI.textContent = checkpointName;
  message.textContent = 'Checkpoint saved! ✨';
}

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'Space' && !e.repeat) jumpQueued = true;
  if (e.code === 'KeyR') resetGame();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
renderer.domElement.addEventListener('mousedown', e => { dragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; });
window.addEventListener('mouseup', () => dragging = false);
window.addEventListener('mousemove', e => {
  if (!dragging) return;
  cameraYaw -= (e.clientX - lastMouseX) * 0.006;
  cameraPitch = THREE.MathUtils.clamp(cameraPitch + (e.clientY - lastMouseY) * 0.004, -0.05, 0.75);
  lastMouseX = e.clientX; lastMouseY = e.clientY;
});
document.getElementById('playAgain').addEventListener('click', resetGame);

const clock = new THREE.Clock();
const moveVec = new THREE.Vector3();
const camOffset = new THREE.Vector3();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.035);
  coins.forEach(c => {
    if (!c.collected) {
      c.mesh.rotation.z += dt * 1.8;
      c.mesh.position.y = c.y + Math.sin(performance.now() * 0.002 + c.z) * 0.09;
    }
  });

  if (!won) {
    const forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
    const side = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    moveVec.set(side, 0, forward);
    if (moveVec.lengthSq() > 0) {
      moveVec.normalize();
      const angle = cameraYaw;
      const dx = moveVec.x * Math.cos(angle) + moveVec.z * Math.sin(angle);
      const dz = -moveVec.x * Math.sin(angle) + moveVec.z * Math.cos(angle);
      player.position.x += dx * 6.5 * dt;
      player.position.z += dz * 6.5 * dt;
      yaw = Math.atan2(dx, dz);
      player.rotation.y = yaw;
    }

    if (jumpQueued && grounded) { verticalVelocity = 8.2; grounded = false; }
    jumpQueued = false;
    verticalVelocity -= 21 * dt;
    const oldY = player.position.y;
    player.position.y += verticalVelocity * dt;
    grounded = false;

    // Land on platform tops while descending.
    if (verticalVelocity <= 0) {
      for (const p of platforms) {
        const within = Math.abs(player.position.x - p.x) < p.w / 2 + playerRadius * 0.35 &&
                      Math.abs(player.position.z - p.z) < p.d / 2 + playerRadius * 0.35;
        const feetOld = oldY;
        const feetNew = player.position.y;
        if (within && feetOld >= p.top - 0.05 && feetNew <= p.top) {
          player.position.y = p.top;
          verticalVelocity = 0;
          grounded = true;
          break;
        }
      }
    }
    if (player.position.y < -2.4) respawn();

    for (const c of coins) {
      if (!c.collected && player.position.distanceTo(new THREE.Vector3(c.x, c.y, c.z)) < 1.15) {
        c.collected = true; c.mesh.visible = false; coinCount++;
        coinsUI.textContent = String(coinCount);
        message.textContent = 'Coin collected! 🪙';
        setTimeout(() => { if (!won) message.textContent = 'Reach the golden finish platform!'; }, 900);
      }
    }
    checkpoints.forEach(cpData => {
      if (Math.abs(player.position.x - cpData.x) < 1.3 && Math.abs(player.position.z - cpData.z) < 1.3 && player.position.y >= cpData.y - 0.3) {
        setCheckpoint(cpData);
      }
    });
    if (player.position.z > 36 && Math.abs(player.position.x - 3) < 3.1 && player.position.y > 1.8) {
      won = true;
      message.textContent = 'Level complete! 🎉';
      document.getElementById('finalScore').textContent = `Coins collected: ${coinCount} / ${coins.length}`;
      overlay.style.display = 'flex';
    }
  }

  // Third-person camera follows behind the character.
  const target = player.position.clone().add(new THREE.Vector3(0, 1.0, 0));
  const distance = 7.5;
  camOffset.set(
    Math.sin(cameraYaw) * Math.cos(cameraPitch) * distance,
    (0.35 + cameraPitch) * distance,
    -Math.cos(cameraYaw) * Math.cos(cameraPitch) * distance
  );
  camera.position.lerp(target.clone().add(camOffset), 0.12);
  camera.lookAt(target);

  renderer.render(scene, camera);
}
player.position.copy(checkpoint);
camera.position.set(0, 5, -8);
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
