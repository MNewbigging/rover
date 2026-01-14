import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class ReturnGoal extends DogGoal {
  name: DogGoalName = "return";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  canFinish(): boolean {
    // Only once all behaviours are done can this goal finish
    return this.behaviours.length === 0 && this.currentBehaviour === undefined;
  }

  setupBehaviours(): void {
    this.behaviours.push(
      new MoveToPlayerBehaviour(this.dog),
      new DropBehaviour(this.dog)
    );

    this.currentBehaviour = this.behaviours.shift();

    console.log("starting return goal");
  }

  update(dt: number): void {
    this.currentBehaviour?.update(dt);

    if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
    }
  }
}
