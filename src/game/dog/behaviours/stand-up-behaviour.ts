import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "./dog-behaviour";

export class StandUpBehaviour extends DogBehaviour {
  async onStart() {
    ("start stand up behaviour");
    // Dog is currently sitting; stand up
    this.dog.animator.play(AnimationAsset.SitToStand);
  }

  canFinish(): boolean {
    return this.dog.animator.isCurrentAnimation(AnimationAsset.Standing);
  }
}
