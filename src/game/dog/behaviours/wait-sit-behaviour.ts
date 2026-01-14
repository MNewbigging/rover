import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "./dog-behaviour";

export class WaitSitBehaviour extends DogBehaviour {
  async onStart() {
    this.dog.animator.play(AnimationAsset.Sitting);
  }

  canFinish(): boolean {
    // todo so long as not in 1-shot anim
    return true;
  }

  update(dt: number): void {
    // todo randomly play 1-shot sitting anims
  }
}
