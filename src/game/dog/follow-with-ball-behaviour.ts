import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";

// For when the player walks away while ball is still on the ground.
// Dog will stand, pick up ball, walk after player
export class FollowWithBallBehaviour extends DogBehaviour {
  name = DogBehaviourName.FollowWithBall;

  shouldFinish(): boolean {
    // If dog has dropped the ball

    throw new Error("Method not implemented.");
  }

  canFinish(): boolean {
    throw new Error("Method not implemented.");
  }

  getNextBehaviourName(): DogBehaviourName {
    throw new Error("Method not implemented.");
  }

  update(dt: number): void {
    throw new Error("Method not implemented.");
  }
}
