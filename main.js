import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';
import { CoinManager } from './coins.js';
import { EnvironmentManager } from './environment.js';
import { SoundManager } from './soundManager.js';
import { UIManager } from './ui.js';

const canvas = document.getElementById('game-canvas');
const speedLines = document.getElementById('speed-lines');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec7ff);
scene.fog = new THREE.Fog(0x8ecdf7, 45, 175);

const camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 5.7, -12);
camera.rotation.x = THREE.MathUtils.degToRad(-15);

const player = new Player(scene);
const environment = new EnvironmentManager(scene);
const obstacles = new ObstacleManager(scene);
const coins = new CoinManager(scene);
const sounds = new SoundManager();
const ui = new UIManager();

const state = {
  running: false,
  gameOver: false,
  score: 0,
  baseSpeed: 11,
  elapsed: 0,
};

function getSpeed() {
  return state.baseSpeed * Math.pow(1.038, state.elapsed);
}

function getDifficulty() {
  return Math.min(3.0, state.elapsed / 16);
}

function resetRun() {
  state.gameOver = false;
  state.score = 0;
  state.elapsed = 0;
  player.reset();
  environment.reset();
  obstacles.reset();
  coins.reset();
  ui.updateScore(0);
  ui.hideGameOver();
}

async function startRun() {
  if (!sounds.ctx) await sounds.init();
  await sounds.ctx.resume();
  resetRun();
  state.running = true;
  ui.hideStart();
  sounds.startMusic();
}

function stopRun() {
  state.running = false;
  state.gameOver = true;
  sounds.stopMusic();
  sounds.play('crash', { volume: 1.2 });
  ui.showGameOver(state.score);
}

const keyState = new Set();
window.addEventListener('keydown', (event) => {
  if (keyState.has(event.code)) return;
  keyState.add(event.code);

  if (!state.running) return;

  if (event.code === 'ArrowLeft') player.moveLane(-1);
  if (event.code === 'ArrowRight') player.moveLane(1);
  if (event.code === 'ArrowUp' && player.jump()) sounds.play('jump');
  if (event.code === 'ArrowDown' && player.slide()) sounds.play('slide');
});
window.addEventListener('keyup', (event) => keyState.delete(event.code));

ui.startBtn.addEventListener('click', startRun);
ui.restartBtn.addEventListener('click', () => startRun());
ui.volumeSlider.addEventListener('input', async (e) => {
  if (!sounds.ctx) await sounds.init();
  sounds.setVolume(Number(e.target.value));
});
ui.muteBtn.addEventListener('click', async () => {
  if (!sounds.ctx) await sounds.init();
  const muted = sounds.toggleMute();
  ui.setMuteLabel(muted);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  let speed = 0;
  if (state.running) {
    state.elapsed += dt;
    speed = getSpeed();
    const difficulty = getDifficulty();

    player.update(dt);
    environment.update(dt, speed);
    obstacles.update(dt, speed, difficulty);
    coins.update(dt, speed);

    const collected = coins.collect(player.bounds);
    if (collected > 0) {
      sounds.play('coin', { volume: 0.5 + Math.min(0.4, collected * 0.1) });
      state.score += collected * 15;
    }

    if (obstacles.getCollidingObstacle(player.bounds)) {
      stopRun();
    }

    state.score += dt * (13 + difficulty * 9);
    ui.updateScore(state.score);
  } else {
    player.update(dt);
  }

  const speedNorm = THREE.MathUtils.clamp((speed || state.baseSpeed) / 28, 0.35, 1.2);
  speedLines.style.opacity = String(0.16 + speedNorm * 0.35);
  speedLines.style.animationDuration = `${1.25 - speedNorm * 0.75}s`;

  const camTarget = new THREE.Vector3(player.group.position.x, player.group.position.y + 5.55, -11.8);
  camera.position.lerp(camTarget, 1 - Math.exp(-8 * dt));
  camera.lookAt(player.group.position.x, player.group.position.y + 1.4, 10.5);

  renderer.render(scene, camera);
}

ui.showStart();
animate(performance.now());
