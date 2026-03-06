import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const TYPES = {
  LOW: 'low',
  OVERHEAD: 'overhead',
  FULL: 'full',
  TRAIN: 'train',
};

const LANE_X = [-3.2, 0, 3.2];

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
    this.pool = [];

    this.spawnTimer = 0;
    this.nextSpawn = 1.2;
    this.lastPatternZ = 45;
  }

  reset() {
    for (const obj of this.active) {
      obj.mesh.visible = false;
      this.pool.push(obj);
    }
    this.active.length = 0;
    this.spawnTimer = 0;
    this.nextSpawn = 1.2;
    this.lastPatternZ = 45;
  }

  update(dt, worldSpeed, difficulty) {
    this.spawnTimer += dt;
    if (this.spawnTimer > this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = Math.max(0.4, 1.22 - difficulty * 0.28 + Math.random() * 0.4);
      this.spawnPattern(difficulty);
    }

    for (let i = this.active.length - 1; i >= 0; i--) {
      const obj = this.active[i];
      obj.mesh.position.z -= worldSpeed * dt;
      obj.bounds.setFromObject(obj.mesh);
      if (obj.mesh.position.z < -45) {
        obj.mesh.visible = false;
        this.pool.push(obj);
        this.active.splice(i, 1);
      }
    }
  }

  getCollidingObstacle(playerBounds) {
    for (const obstacle of this.active) {
      if (obstacle.bounds.intersectsBox(playerBounds)) return obstacle;
    }
    return null;
  }

  spawnPattern(difficulty) {
    const baseZ = this.lastPatternZ + 16 + Math.random() * 9;
    this.lastPatternZ = baseZ;

    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const spawnCount = difficulty > 0.85 ? 2 : 1;
    const used = [];

    for (let i = 0; i < spawnCount; i++) {
      const lane = lanes[i];
      const typeRoll = Math.random();
      let type = TYPES.LOW;
      if (typeRoll > 0.8) type = TYPES.TRAIN;
      else if (typeRoll > 0.56) type = TYPES.FULL;
      else if (typeRoll > 0.28) type = TYPES.OVERHEAD;

      const offset = i === 0 ? 0 : 5.2;
      this.spawnObstacle(type, lane, baseZ + offset);
      used.push(lane);
    }

    // soft follow-up single obstacle in one used lane only
    if (difficulty > 1.4 && Math.random() > 0.64) {
      const lane = used[Math.floor(Math.random() * used.length)];
      this.spawnObstacle(TYPES.LOW, lane, baseZ + 10.5);
    }
  }

  spawnObstacle(type, lane, z) {
    const obstacle = this.getFromPool(type);
    obstacle.type = type;
    obstacle.mesh.position.set(LANE_X[lane], 0, z);
    obstacle.mesh.visible = true;
    obstacle.mesh.userData.lane = lane;

    if (type === TYPES.LOW) {
      obstacle.mesh.scale.set(1.25, 0.85, 1.05);
      obstacle.mesh.position.y = 0.42;
    } else if (type === TYPES.OVERHEAD) {
      obstacle.mesh.scale.set(1.4, 0.75, 1.05);
      obstacle.mesh.position.y = 2.45;
    } else if (type === TYPES.FULL) {
      obstacle.mesh.scale.set(1.45, 1.8, 1.35);
      obstacle.mesh.position.y = 0.95;
    } else {
      obstacle.mesh.scale.set(1.8, 2.2, 9.2);
      obstacle.mesh.position.y = 1.15;
    }

    obstacle.bounds.setFromObject(obstacle.mesh);
    this.active.push(obstacle);
  }

  getFromPool(type) {
    const idx = this.pool.findIndex((p) => p.type === type);
    if (idx !== -1) return this.pool.splice(idx, 1)[0];

    const palette = {
      low: 0xff4a2f,
      overhead: 0xffd257,
      full: 0x7f47ff,
      train: 0x278be6,
    };

    let geometry;
    if (type === TYPES.LOW) geometry = new THREE.BoxGeometry(1, 1, 1);
    else if (type === TYPES.OVERHEAD) geometry = new THREE.BoxGeometry(1, 1, 1);
    else if (type === TYPES.FULL) geometry = new THREE.BoxGeometry(1, 1, 1);
    else geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshStandardMaterial({
      color: palette[type],
      roughness: 0.38,
      metalness: type === TYPES.TRAIN ? 0.5 : 0.25,
      emissive: palette[type],
      emissiveIntensity: 0.09,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (type === TYPES.LOW) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.02, 0.15, 1.08),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      stripe.position.y = 0.3;
      mesh.add(stripe);
    }

    if (type === TYPES.TRAIN) {
      const windowRow = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.3, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x143f66, emissiveIntensity: 0.35 })
      );
      for (let i = -4; i <= 4; i++) {
        const w = windowRow.clone();
        w.position.set(0, 0.2, i);
        mesh.add(w);
      }
    }

    this.scene.add(mesh);
    return { type, mesh, bounds: new THREE.Box3() };
  }
}
