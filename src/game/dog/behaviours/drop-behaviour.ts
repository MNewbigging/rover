import * as THREE from "three";
import { DogBehaviour } from "./dog-behaviour";
import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";

// Ball is always dropped from standing-equivalent anim
export class DropBehaviour extends DogBehaviour {
  async onStart() {
    console.log("start drop behaviour");

    this.dropBall();
    this.dog.animator.play(AnimationAsset.StandToSit);
  }

  canFinish(): boolean {
    return (
      this.dog.ball.state === BallState.AtRest &&
      !this.dog.animator.isCurrentAnimation(AnimationAsset.StandToSit)
    );
  }

  update(dt: number): void {
    // Nothing to do here
  }

  private dropBall() {
    // Unparent ball from dog, restart physics
    const ball = this.dog.ball;
    const worldPosition = new THREE.Vector3();
    ball.renderComponent.getWorldPosition(worldPosition);
    this.dog.jawBone?.remove(ball.renderComponent);
    this.dog.scene.add(ball.renderComponent);
    ball.renderComponent.scale.multiplyScalar(0.01);

    ball.physicsBody.position.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );
    ball.restartPhysics();

    this.dog.ball.state = BallState.AtRest;
  }
}
