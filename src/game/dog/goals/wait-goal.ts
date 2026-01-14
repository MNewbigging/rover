import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { DogBehaviour } from "../behaviours/dog-behaviour";
import { StandUpBehaviour } from "../behaviours/stand-up-behaviour";
import { WaitSitBehaviour } from "../behaviours/wait-sit-behaviour";
import { WaitStandBehaviour } from "../behaviours/wait-stand-behaviour";
import { DogGoal, DogGoalName } from "./dog-goal";

export class WaitGoal extends DogGoal {
  name: DogGoalName = "wait";
  behaviours: DogBehaviour[] = [];
  currentBehaviour?: DogBehaviour;

  canFinish(): boolean {
    // Only need to check current behaviour, don't need to finish multiple
    return this.currentBehaviour?.canFinish() ?? true;
  }

  setupBehaviours() {
    if (this.dog.ball.state === BallState.AtRest) {
      this.currentBehaviour = new WaitSitBehaviour(this.dog);
    }

    if (this.dog.ball.state === BallState.WithPlayer) {
      this.currentBehaviour = new WaitStandBehaviour(this.dog);
    }

    console.log("starting wait goal");
  }

  update(dt: number): void {
    // todo If the behaviour would change (sit to stand) then what?
    this.currentBehaviour?.update(dt);

    // In case player picks up ball while sitting
    if (
      this.currentBehaviour instanceof WaitSitBehaviour &&
      this.dog.ball.state === BallState.WithPlayer
    ) {
      // Wait until it can finish
      if (this.currentBehaviour?.canFinish()) {
        this.behaviours = [
          new StandUpBehaviour(this.dog),
          new WaitStandBehaviour(this.dog),
        ];
        this.currentBehaviour = this.behaviours.shift();
      }
    } else if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
    }
  }
}
