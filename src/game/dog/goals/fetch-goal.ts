import { DogBehaviour } from "../behaviours/dog-behaviour";
import { MoveToBallBehaviour } from "../behaviours/move-to-ball-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { DogGoal } from "./dog-goal";

export class FetchGoal extends DogGoal {
  behaviours: DogBehaviour[] = [];

  setupBehaviours(): void {
    this.behaviours.push(
      new MoveToBallBehaviour(this.dog),
      new PickupBehaviour(this.dog)
    );
  }

  update(dt: number): void {
    throw new Error("Method not implemented.");
  }
}
