import * as CANNON from "cannon-es";
import * as THREE from "three";
import { PhysicsObject } from "./physics-object";

export class Ground extends PhysicsObject {
  constructor() {
    const physicsBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });

    const renderComponent = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ color: "green" })
    );

    super(physicsBody, renderComponent);

    // Ground never moves, but it needs rotating once at the start:
    this.physicsBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI / 2
    );

    this.renderComponent.rotateX(-Math.PI / 2);
  }
}
