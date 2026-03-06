import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const LANE_X = [-3.2, 0, 3.2];

export class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
    this.pool = [];

    this.spawnTimer = 0;
    this.nextSpawn = 1.1;
    this.lastSpawnZ = 40;
  }

  reset() {
    for (const coin of this.active) {
      coin.mesh.visible = false;
      this.pool.push(coin);
    }
    this.active.length = 0;
    this.spawnTimer = 0;
    this.nextSpawn = 1.1;
    this.lastSpawnZ = 40;
  }

  update(dt, worldSpeed) {
    this.spawnTimer += dt;
    if (this.spawnTimer > this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = 0.8 + Math.random() * 0.6;
      this.spawnPattern();
    }

    for (let i = this.active.length - 1; i >= 0; i--) {
      const coin = this.active[i];
      coin.mesh.position.z -= worldSpeed * dt;
      coin.mesh.rotation.y += dt * 7;
      coin.mesh.rotation.z += dt * 4;
      coin.bounds.setFromObject(coin.mesh);
      if (coin.mesh.position.z < -24) {
        coin.mesh.visible = false;
        this.pool.push(coin);
        this.active.splice(i, 1);
      }
    }
  }

  collect(playerBounds) {
    let gained = 0;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const coin = this.active[i];
      if (coin.bounds.intersectsBox(playerBounds)) {
        coin.mesh.visible = false;
        this.pool.push(coin);
        this.active.splice(i, 1);
        gained += 1;
      }
    }
    return gained;
  }

  spawnPattern() {
    const z = this.lastSpawnZ + 12 + Math.random() * 8;
    this.lastSpawnZ = z;
    const pattern = ['line', 'arc', 'zigzag'][Math.floor(Math.random() * 3)];

    if (pattern === 'line') {
      const lane = Math.floor(Math.random() * 3);
      for (let i = 0; i < 7; i++) {
        this.spawnCoin(lane, 1.1, z + i * 2.2);
      }
    } else if (pattern === 'arc') {
      const lane = Math.floor(Math.random() * 3);
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const y = 1.2 + Math.sin(t * Math.PI) * 2.2;
        this.spawnCoin(lane, y, z + i * 1.9);
      }
    } else {
      for (let i = 0; i < 9; i++) {
        const lane = i % 3;
        this.spawnCoin(lane, 1.3 + ((i + 1) % 2) * 0.25, z + i * 1.7);
      }
    }
  }

  spawnCoin(lane, y, z) {
    const coin = this.getFromPool();
    coin.mesh.position.set(LANE_X[lane], y, z);
    coin.mesh.visible = true;
    coin.bounds.setFromObject(coin.mesh);
    this.active.push(coin);
  }

  getFromPool() {
    if (this.pool.length) return this.pool.pop();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.14, 18),
      new THREE.MeshStandardMaterial({
        color: 0xffdb4d,
        emissive: 0x7f5600,
        emissiveIntensity: 0.33,
        metalness: 0.7,
        roughness: 0.25,
      })
    );
    mesh.rotation.x = Math.PI / 2;
    this.scene.add(mesh);
    return { mesh, bounds: new THREE.Box3() };
  }
}
