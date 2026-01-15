import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class ReturnGoal extends DogGoal {
  name: DogGoalName = "return";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  getNextGoalName(): DogGoalName | undefined {
    // If completed all behaviours can wait
    if (this.canFinish()) return "wait";

    return undefined;
  }

  setupBehaviours(): void {
    this.behaviours.push(
      new MoveToPlayerBehaviour(this.dog),
      new DropBehaviour(this.dog)
    );

    console.log("starting return goal");
  }
}
