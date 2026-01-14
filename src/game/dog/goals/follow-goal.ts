import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { DogGoal } from "./dog-goal";

export class FollowGoal extends DogGoal {
  behaviours: DogBehaviour[] = [];

  setupBehaviours(): void {
    // If the player has the ball, just need to follow them
    if (this.dog.ball.playerHasBall) {
      this.behaviours.push(new MoveToPlayerBehaviour(this.dog));
    } else {
      // Otherwise, need to pickup then follow then drop!
      this.behaviours.push(
        new PickupBehaviour(this.dog),
        new MoveToPlayerBehaviour(this.dog),
        new DropBehaviour(this.dog)
      );
    }
  }

  update(dt: number): void {
    throw new Error("Method not implemented.");
  }
}
