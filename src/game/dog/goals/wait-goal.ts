import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { SitDownBehaviour } from "../behaviours/sit-down-behaviour";
import { WaitSitBehaviour } from "../behaviours/wait-sit-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

// Dog should sit down and perform 1-shot animations while sitting
export class WaitGoal extends DogGoal {
  name: DogGoalName = "wait";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  getNextGoalName(): DogGoalName | undefined {
    // Fetch if the ball is thrown
    if (this.dog.ball.state === BallState.Thrown) return "fetch";

    // Follow if the player moves away
    if (this.shouldFollow()) return "follow";

    // Otherwise, there's no next goal for now
    return undefined;
  }

  canFinish(): boolean {
    // So long as the dog is sitting this can finish
    return this.dog.animator.isCurrentAnimation(AnimationAsset.Sitting);
  }

  setupBehaviours() {
    // Sit down first if not already sitting
    if (!this.dog.animator.isCurrentAnimation(AnimationAsset.Sitting)) {
      this.behaviours.push(new SitDownBehaviour(this.dog));
    }

    // Then wait
    this.behaviours.push(new WaitSitBehaviour(this.dog));
  }

  private shouldFollow() {
    return (
      this.dog.position.distanceTo(this.dog.camera.position) >
      this.dog.followThreshold
    );
  }
}
