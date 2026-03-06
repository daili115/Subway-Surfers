import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const LANE_X = [-3.2, 0, 3.2];

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.trackSegments = [];
    this.trainProps = [];
    this.scenery = [];
    this.wireGroups = [];

    this.segmentLength = 34;
    this.segmentCount = 10;

    this.createLights();
    this.createSkyAndGround();
    this.createSegments();
    this.createScenery();
    this.createMovingTrains();
    this.createOverheadWires();
  }

  createLights() {
    const hemi = new THREE.HemisphereLight(0x87d5ff, 0xffd4a0, 0.9);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff3de, 1.0);
    sun.position.set(-14, 20, 4);
    sun.castShadow = true;
    this.scene.add(sun);
  }

  createSkyAndGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 620),
      new THREE.MeshStandardMaterial({ color: 0x7d5b42, roughness: 0.96 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.03, 180);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const ballast = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 620),
      new THREE.MeshStandardMaterial({ color: 0x8e6b50, roughness: 0.9 })
    );
    ballast.rotation.x = -Math.PI / 2;
    ballast.position.set(0, -0.015, 180);
    this.scene.add(ballast);
  }

  createSegments() {
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe0e6f0, metalness: 0.9, roughness: 0.2 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x43362c, roughness: 0.75 });
    const laneFillMat = new THREE.MeshStandardMaterial({ color: 0xa67b59, roughness: 0.98 });

    for (let i = 0; i < this.segmentCount; i++) {
      const group = new THREE.Group();
      group.position.z = i * this.segmentLength;

      const laneFill = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, this.segmentLength), laneFillMat);
      laneFill.position.set(0, 0.02, this.segmentLength * 0.5);
      group.add(laneFill);

      for (const laneX of LANE_X) {
        const railL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, this.segmentLength), railMat);
        railL.position.set(laneX - 0.52, 0.08, this.segmentLength * 0.5);
        group.add(railL);

        const railR = railL.clone();
        railR.position.x = laneX + 0.52;
        group.add(railR);

        for (let s = 0; s < 11; s++) {
          const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.45), sleeperMat);
          sleeper.position.set(laneX, 0.03, s * 3 + 1.4);
          group.add(sleeper);
        }
      }

      this.trackSegments.push(group);
      this.scene.add(group);
    }
  }

  createScenery() {
    const buildingPalette = [0xd24f5f, 0x46a5d9, 0xe2a43a, 0x60b667, 0x8f6ae5];

    for (let i = 0; i < 40; i++) {
      const z = i * 18 + 8;
      const side = i % 2 === 0 ? -1 : 1;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 5 + Math.random() * 4, 7 + Math.random() * 3),
        new THREE.MeshStandardMaterial({
          color: buildingPalette[i % buildingPalette.length],
          roughness: 0.8,
          emissive: 0x080808,
          emissiveIntensity: 0.2,
        })
      );
      building.position.set(side * (12 + Math.random() * 4), building.geometry.parameters.height * 0.5, z);
      this.scene.add(building);
      this.scenery.push(building);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.24, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x69472f })
      );
      trunk.position.set(side * 8.5, 0.6, z + 4);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 0.35, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x5cbf58, roughness: 0.85 })
      );
      leaves.position.set(0, 1.2, 0);
      trunk.add(leaves);

      this.scene.add(trunk);
      this.scenery.push(trunk);
    }
  }

  createMovingTrains() {
    for (let i = 0; i < 6; i++) {
      const lane = i % 3;
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 2.4, 10),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0x2b67d4 : 0x1f8f8d, roughness: 0.35, metalness: 0.45 })
      );
      body.position.set(LANE_X[lane], 1.2, 35 + i * 34);
      this.scene.add(body);
      this.trainProps.push({ mesh: body, lane, speedFactor: 0.2 + Math.random() * 0.45 });
    }
  }

  createOverheadWires() {
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x2f2f39, roughness: 0.75 });
    for (let i = 0; i < 20; i++) {
      const group = new THREE.Group();
      group.position.z = i * 17 + 4;

      const bar = new THREE.Mesh(new THREE.BoxGeometry(17, 0.08, 0.08), wireMat);
      bar.position.y = 6.2;
      group.add(bar);

      for (const x of [-5.5, 0, 5.5]) {
        const drop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 0.05), wireMat);
        drop.position.set(x, 5.25, 0);
        group.add(drop);
      }

      this.scene.add(group);
      this.wireGroups.push(group);
    }
  }

  reset() {
    for (let i = 0; i < this.trackSegments.length; i++) {
      this.trackSegments[i].position.z = i * this.segmentLength;
    }
  }

  update(dt, worldSpeed) {
    for (const segment of this.trackSegments) {
      segment.position.z -= worldSpeed * dt;
      if (segment.position.z < -this.segmentLength) {
        segment.position.z += this.segmentLength * this.segmentCount;
      }
    }

    for (const wire of this.wireGroups) {
      wire.position.z -= worldSpeed * dt;
      if (wire.position.z < -10) wire.position.z += 340;
    }

    for (const p of this.trainProps) {
      p.mesh.position.z -= worldSpeed * dt * p.speedFactor;
      if (p.mesh.position.z < -40) {
        p.mesh.position.z += 240;
        p.mesh.position.x = LANE_X[Math.floor(Math.random() * 3)];
      }
    }

    for (const item of this.scenery) {
      item.position.z -= worldSpeed * dt;
      if (item.position.z < -40) item.position.z += 360;
    }
  }
}
