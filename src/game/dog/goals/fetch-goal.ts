import { DogBehaviour } from "../behaviours/dog-behaviour";
import { MoveToBallBehaviour } from "../behaviours/move-to-ball-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class FetchGoal extends DogGoal {
  name: DogGoalName = "fetch";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  canFinish(): boolean {
    // Only once all behaviours are done can this goal finish
    return this.behaviours.length === 0 && this.currentBehaviour === undefined;
  }

  setupBehaviours(): void {
    this.behaviours.push(
      new MoveToBallBehaviour(this.dog),
      new PickupBehaviour(this.dog)
    );

    this.currentBehaviour = this.behaviours.shift();

    console.log("starting fetch goal");
  }

  update(dt: number): void {
    this.currentBehaviour?.update(dt);

    if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
    }
  }
}
