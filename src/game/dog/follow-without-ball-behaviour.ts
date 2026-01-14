import { AnimationAsset } from "../asset-manager";
import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";

// If player has picked up ball and moved away. Starts with dog Standing
export class FollowWithoutBallBehaviour extends DogBehaviour {
  name = DogBehaviourName.FollowWithoutBall;

  onStart() {
    this.dog.animator.play(AnimationAsset.Walking);
  }

  shouldFinish(): boolean {
    // If player is close enough or has thrown the ball
    return (
      this.dog.position.distanceTo(this.dog.camera.position) <= 3 ||
      this.dog.ball.wasThrown
    );
  }

  canFinish(): boolean {
    // Can finish at any time (providing it SHOULD finish!)
    return true;
  }

  onFinish() {
    // Stop walking and move to standing - allows for moving to fetch or wait
    this.dog.animator.play(AnimationAsset.Standing);
  }

  getNextBehaviourName(): DogBehaviourName {
    return this.dog.ball.wasThrown
      ? DogBehaviourName.Fetching
      : DogBehaviourName.Waiting;
  }

  update(dt: number) {
    // Move towards player
    this.dog.moveTowardsPosition(this.dog.camera.position, dt);
  }
}
