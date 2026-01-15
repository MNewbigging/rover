import * as THREE from "three";
import { DogBehaviour } from "./dog-behaviour";
import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { NewDog } from "../new-dog";

export class MoveToPlayerBehaviour extends DogBehaviour {
  constructor(
    private moveAnim: AnimationAsset.Running | AnimationAsset.Walking,
    dog: NewDog
  ) {
    super(dog);
  }

  async onStart() {
    // The goal provides the context for whether we walk or run
    this.dog.animator.play(this.moveAnim);
  }

  canFinish(): boolean {
    // Can finish when near enough player
    return (
      this.dog.position.distanceTo(this.dog.camera.position) <
      this.dog.waitThreshold
    );
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
