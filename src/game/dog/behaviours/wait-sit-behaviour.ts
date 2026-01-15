import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { DogBehaviour } from "./dog-behaviour";

export class WaitSitBehaviour extends DogBehaviour {
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
    }
  }
}
