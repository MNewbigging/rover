import { AnimationAsset } from "../../asset-manager";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { MoveToBallBehaviour } from "../behaviours/move-to-ball-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { StandUpBehaviour } from "../behaviours/stand-up-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class FetchGoal extends DogGoal {
  name: DogGoalName = "fetch";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  getNextGoalName(): DogGoalName | undefined {
    // Can return once this goal is fully completed
    if (this.canFinish()) return "return";

    // Otherwise, continue to fetch
    return undefined;
  }

  setupBehaviours(): void {
    // Might have been waiting when the ball was thrown
    if (this.dog.animator.isCurrentAnimation(AnimationAsset.Sitting)) {
      this.behaviours.push(new StandUpBehaviour(this.dog));
    }

    // Move to the ball and pick it up
    this.behaviours.push(
      new MoveToBallBehaviour(this.dog),
      new PickupBehaviour(this.dog)
    );
  }
}
