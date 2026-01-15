import * as THREE from "three";
import { DogBehaviour } from "./dog-behaviour";
import { AnimationAsset } from "../../asset-manager";

export class MoveToPlayerBehaviour extends DogBehaviour {
  async onStart() {
    console.log("start move to player behaviour");
    this.dog.animator.play(AnimationAsset.Walking);
  }

  canFinish(): boolean {
    // Can finish when near enough player
    return this.dog.position.distanceTo(this.dog.camera.position) < 3;
  }

  override update(dt: number): void {
    this.moveTowardsPosition(this.dog.camera.position, dt);
  }

  private moveTowardsPosition(position: THREE.Vector3, dt: number) {
    const direction = position.clone().sub(this.dog.position).normalize();
    const nextPos = this.dog.position
      .clone()
      .add(direction.multiplyScalar(this.dog.moveSpeed * dt));

    // Ensure dog stays on the floor (will move upwards when running towards camera pos)
    nextPos.y = 0;

    // TODO get the bending/turning animations working
    this.dog.lookAt(nextPos);
    this.dog.position.copy(nextPos);
  }
}
