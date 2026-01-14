import { DogBehaviour } from "../behaviours/dog-behaviour";
import { DogGoal } from "./dog-goal";

export class FollowGoal extends DogGoal {
  behaviours: DogBehaviour[] = [];

  setupBehaviours(): void {
    // If the player has the ball, just need to follow them
    if (this.dog.ball.playerHasBall) {
      this.behaviours.push();
    }
  }

  update(dt: number): void {
    throw new Error("Method not implemented.");
  }
}
