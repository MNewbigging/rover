import * as THREE from "three";
import { DogBehaviour } from "./dog-behaviour";
import { AnimationAsset } from "../../asset-manager";

export class MoveToBallBehaviour extends DogBehaviour {
  async onStart() {
    ("start move to ball behaviour");

    this.dog.animator.play(AnimationAsset.Running);
  }

  canFinish(): boolean {
    // Can finish when near enough ball
    return (
      this.dog.position.distanceTo(this.dog.ball.renderComponent.position) < 1
    );
  }

  override update(dt: number): void {
    // todo walk when close to ball

    this.moveTowardsPosition(this.dog.ball.renderComponent.position, dt);
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
