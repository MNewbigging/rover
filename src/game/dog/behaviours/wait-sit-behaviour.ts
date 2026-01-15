import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "./dog-behaviour";

export class WaitSitBehaviour extends DogBehaviour {
  async onStart() {
    console.log("start wait sit behaviour");
    this.dog.animator.play(AnimationAsset.Sitting);
  }

  canFinish(): boolean {
    // todo so long as not in 1-shot anim
    return false; // if true this behaviour will end
  }
}
