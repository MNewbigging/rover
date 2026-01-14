import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { DogGoal } from "./dog-goal";

export class ReturnGoal extends DogGoal {
  behaviours: DogBehaviour[] = [];

  setupBehaviours(): void {
    this.behaviours.push(
      new MoveToPlayerBehaviour(this.dog),
      new DropBehaviour(this.dog)
    );
  }

  update(dt: number): void {
    throw new Error("Method not implemented.");
  }
}
