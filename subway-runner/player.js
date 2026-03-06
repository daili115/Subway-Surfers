import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const LANE_X = [-3.2, 0, 3.2];

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.43, 1.1, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x1ee2ff, roughness: 0.35 })
    );
    body.position.y = 1.25;
    this.group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd9bc, roughness: 0.5 })
    );
    head.position.y = 1.95;
    this.group.add(head);

    const hoodie = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.35, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xff4f59, roughness: 0.45 })
    );
    hoodie.position.y = 1.56;
    this.group.add(hoodie);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.09, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xffcf4d, roughness: 0.35, emissive: 0x5e4200, emissiveIntensity: 0.3 })
    );
    board.position.y = 0.25;
    this.group.add(board);

    this.scene.add(this.group);

    this.lane = 1;
    this.targetLane = 1;
    this.switchDuration = 0.2;
    this.switchT = 1;
    this.switchStartX = 0;

    this.positionY = 0;
    this.velocityY = 0;
    this.gravity = -31;
    this.jumpVelocity = 11.6;
    this.isGrounded = true;

    this.isSliding = false;
    this.slideDuration = 0.7;
    this.slideTimer = 0;

    this.runAnim = 0;
    this.bounds = new THREE.Box3();
    this.update(0);
  }

  reset() {
    this.lane = 1;
    this.targetLane = 1;
    this.switchT = 1;
    this.group.position.set(0, 0, 0);
    this.positionY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.group.scale.y = 1;
    this.group.rotation.set(0, 0, 0);
    this.update(0);
  }

  moveLane(dir) {
    const next = THREE.MathUtils.clamp(this.targetLane + dir, 0, 2);
    if (next === this.targetLane) return;
    this.lane = this.targetLane;
    this.targetLane = next;
    this.switchT = 0;
    this.switchStartX = this.group.position.x;
  }

  jump() {
    if (!this.isGrounded || this.isSliding) return false;
    this.velocityY = this.jumpVelocity;
    this.isGrounded = false;
    return true;
  }

  slide() {
    if (!this.isGrounded || this.isSliding) return false;
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
    return true;
  }

  update(dt) {
    if (this.switchT < 1) {
      this.switchT = Math.min(1, this.switchT + dt / this.switchDuration);
      const eased = this.switchT * (2 - this.switchT);
      this.group.position.x = THREE.MathUtils.lerp(this.switchStartX, LANE_X[this.targetLane], eased);
      if (this.switchT === 1) this.lane = this.targetLane;
    }

    if (!this.isGrounded) {
      this.velocityY += this.gravity * dt;
      this.positionY += this.velocityY * dt;
      if (this.positionY <= 0) {
        this.positionY = 0;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      this.group.scale.y = 0.55;
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, -0.2, 18 * dt);
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.group.scale.y = 1;
      }
    } else {
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, 0, 12 * dt);
    }

    this.runAnim += dt * 14;
    const bob = this.isGrounded && !this.isSliding ? Math.sin(this.runAnim) * 0.04 : 0;
    this.group.position.y = this.positionY + bob;
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, (this.targetLane - 1) * -0.12, 9 * dt);

    this.updateBounds();
  }

  updateBounds() {
    const halfHeight = this.isSliding ? 0.52 : 1.2;
    const center = new THREE.Vector3(this.group.position.x, this.positionY + halfHeight, this.group.position.z);
    this.bounds.min.set(center.x - 0.45, center.y - halfHeight, center.z - 0.45);
    this.bounds.max.set(center.x + 0.45, center.y + halfHeight, center.z + 0.45);
  }
}
