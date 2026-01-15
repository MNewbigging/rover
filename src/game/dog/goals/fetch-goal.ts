import { DogBehaviour } from "../behaviours/dog-behaviour";
import { MoveToBallBehaviour } from "../behaviours/move-to-ball-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
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
    // Might have been waiting or following

    this.behaviours.push(
      new MoveToBallBehaviour(this.dog),
      new PickupBehaviour(this.dog)
    );

    console.log("starting fetch goal");
  }

  update(dt: number): void {
    this.currentBehaviour?.update(dt);

    if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
    }
  }
}
