import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "./dog-behaviour";

export class SitDownBehaviour extends DogBehaviour {
  async onStart() {
    ("start sit down behaviour");
    this.dog.animator.play(AnimationAsset.StandToSit);
  }

  canFinish(): boolean {
    return this.dog.animator.isCurrentAnimation(AnimationAsset.Sitting);
  }
}
