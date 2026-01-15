import { AnimationAsset } from "../../asset-manager";
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
    // Either:

    // Player has ball, dog starts following and then the player throws ball before dog gets close
    // Dog would be standing so can move into a fetch.
    if (this.dog.ball.state === BallState.Thrown) return true;

    // Player has ball, dog follows and gets close and should wait. Can move into wait.
    if (this.dog.ball.state === BallState.WithPlayer) return true;

    // 2 - Dog has ball, dog drops in front of player. Woudl be interrupted by a wait.
    // Ball would have been dropped, can wait so long as not in sit transition

    return this.dog.animator.isCurrentAnimation(AnimationAsset.Sitting);
  }

  setupBehaviours(): void {
    // Only follows the Wait goal, which ends with the dog sitting
    this.behaviours.push(new StandUpBehaviour(this.dog));

    // If the player has the ball, just need to follow them
    if (this.dog.ball.state === BallState.WithPlayer) {
      this.behaviours.push(
        new MoveToPlayerBehaviour(AnimationAsset.Walking, this.dog)
      );
    } else {
      // Otherwise, need to pickup then follow then drop!
      this.behaviours.push(
        new PickupBehaviour(this.dog),
        new MoveToPlayerBehaviour(AnimationAsset.Walking, this.dog),
        new DropBehaviour(this.dog)
      );
    }
  }

  private shouldWait() {
    return (
      this.dog.position.distanceTo(this.dog.camera.position) <
      this.dog.waitThreshold
    );
  }
}
