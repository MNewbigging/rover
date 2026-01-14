import { BallState } from "../../ball";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class FollowGoal extends DogGoal {
  name: DogGoalName = "follow";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  canFinish(): boolean {
    // Only once all behaviours are done can this goal finish
    return this.behaviours.length === 0 && this.currentBehaviour === undefined;
  }

  setupBehaviours(): void {
    // If the player has the ball, just need to follow them
    if (this.dog.ball.state === BallState.WithPlayer) {
      this.behaviours.push(new MoveToPlayerBehaviour(this.dog));
    } else {
      // Otherwise, need to pickup then follow then drop!
      this.behaviours.push(
        new PickupBehaviour(this.dog),
        new MoveToPlayerBehaviour(this.dog),
        new DropBehaviour(this.dog)
      );
    }

    this.currentBehaviour = this.behaviours.shift();

    console.log("starting follow goal");
  }

  update(dt: number): void {
    this.currentBehaviour?.update(dt);

    if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
    }
  }
}
