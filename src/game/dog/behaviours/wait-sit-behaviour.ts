import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { DogBehaviour } from "./dog-behaviour";

export class WaitSitBehaviour extends DogBehaviour {
  private idleAnimTimer = 3;

  async onStart() {
    this.dog.animator.play(AnimationAsset.Sitting);
  }

  canFinish(): boolean {
    // We want this behaviour to last forever until the goal is interrupted
    return false; // if true this behaviour will end
  }

  update(dt: number) {
    if (this.dog.ball.state === BallState.WithPlayer) {
      this.dog.animator.play(AnimationAsset.TailWagSit);
    } else {
      this.idleAnimTimer -= dt;
      if (this.idleAnimTimer <= 0) {
        // Play a random idle anim
        this.dog.animator.play(
          Math.random() < 0.5
            ? AnimationAsset.ScratchSit
            : AnimationAsset.BegSit
        );
        this.idleAnimTimer = 3 + Math.random() * 7;
      }
    }
  }
}
