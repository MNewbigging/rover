import * as CANNON from "cannon-es";
import * as THREE from "three";

export class PhysicsObject {
  private physicsStopped = false;

  constructor(
    public physicsBody: CANNON.Body,
    public renderComponent: THREE.Object3D,
    protected physicsWorld: CANNON.World
  ) {}

  set position(pos: { x: number; y: number; z: number }) {
    this.physicsBody.position.set(pos.x, pos.y, pos.z);
  }

  update() {
    if (this.physicsStopped) return;

    this.renderComponent.position.copy(this.physicsBody.position);
    this.renderComponent.quaternion.copy(this.physicsBody.quaternion);
  }

  stopPhysics() {
    this.physicsStopped = true;
    this.physicsWorld.removeBody(this.physicsBody);
    this.physicsBody.velocity.set(0, 0, 0);
    this.physicsBody.angularVelocity.set(0, 0, 0);
  }

  restartPhysics() {
    this.physicsStopped = false;
    this.physicsWorld.addBody(this.physicsBody);
  }
}
