import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { WaitSitBehaviour } from "../behaviours/wait-sit-behaviour";
import { WaitStandBehaviour } from "../behaviours/wait-stand-behaviour";
import { DogGoal } from "./dog-goal";

export class WaitGoal extends DogGoal {
  behaviours: DogBehaviour[] = [];

  setupBehaviours() {
    // Waiting depends on current animation state
    const anim = this.dog.animator.currentAnimation;
    if (anim === AnimationAsset.Sitting) {
      this.behaviours.push(new WaitSitBehaviour(this.dog));
    } else if (anim === AnimationAsset.Standing) {
      this.behaviours.push(new WaitStandBehaviour(this.dog));
    }
  }

  update(dt: number): void {
    // If the behaviour would change (sit to stand) then what?
  }
}
