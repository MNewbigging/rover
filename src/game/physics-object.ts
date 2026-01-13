import * as CANNON from "cannon-es";
import * as THREE from "three";

export class PhysicsObject {
  constructor(
    public physicsBody: CANNON.Body,
    public renderComponent: THREE.Object3D
  ) {}

  set position(pos: { x: number; y: number; z: number }) {
    this.physicsBody.position.set(pos.x, pos.y, pos.z);
  }

  update() {
    this.renderComponent.position.copy(this.physicsBody.position);
    this.renderComponent.quaternion.copy(this.physicsBody.quaternion);
  }
}
