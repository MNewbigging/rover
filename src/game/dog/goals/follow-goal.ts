import { BallState } from "../../ball";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DropBehaviour } from "../behaviours/drop-behaviour";
import { MoveToPlayerBehaviour } from "../behaviours/move-to-player-behaviour";
import { PickupBehaviour } from "../behaviours/pickup-behaviour";
import { StandUpBehaviour } from "../behaviours/stand-up-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

// Only comes after the Wait goal, could go to either Wait or Fetch
// Therefore dog should be sitting when this starts and may end during walk/sit
export class FollowGoal extends DogGoal {
  name: DogGoalName = "follow";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  getNextGoalName(): DogGoalName | undefined {
    // Fetch if the ball is thrown
    if (this.dog.ball.state === BallState.Thrown) return "fetch";

    // Wait if close enough to the player
    if (this.shouldWait()) return "wait";

    // Cotinue to follow
    return undefined;
  }

  canFinish(): boolean {
    // This can be interrupted by a throw
    return this.dog.ball.state === BallState.Thrown;
  }

  setupBehaviours(): void {
    // Only follows the Wait goal, which ends with the dog sitting
    this.behaviours.push(new StandUpBehaviour(this.dog));

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

    console.log("starting follow goal");
  }

  private shouldWait() {
    return this.dog.position.distanceTo(this.dog.camera.position) < 3;
  }
}
