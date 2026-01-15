import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "./dog-behaviour";

export class WaitStandBehaviour extends DogBehaviour {
  async onStart() {
    this.dog.animator.play(AnimationAsset.Standing);
  }

  canFinish(): boolean {
    // todo so long as not in 1-shot anim
    return true;
  }
}
