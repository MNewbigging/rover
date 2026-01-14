import { AnimationAsset } from "../asset-manager";
import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";

// should I split into DogSitWait and DogStandWait?
export class WaitingBehaviour extends DogBehaviour {
  name = DogBehaviourName.Waiting;

  shouldFinish() {
    // If the player moves far enough away or throws the ball
    return (
      this.dog.position.distanceTo(this.dog.camera.position) > 5 ||
      this.dog.ball.wasThrown
    );
  }

  canFinish() {
    // Cannot end during a transition animation
    const anim = this.dog.animator.currentAnimation;
    return anim !== AnimationAsset.SitToStand;
  }

  getNextBehaviourName(): DogBehaviourName {
    // This can either move into follow or fetch
    if (this.dog.ball.wasThrown) return DogBehaviourName.Fetching;

    return this.dog.ball.playerHasBall
      ? DogBehaviourName.FollowWithoutBall
      : DogBehaviourName.FollowWithBall;
  }

  update() {
    // todo randomly play one-shot idle animations (type depends on sitting/standing)

    // If the player has picked up the ball
    if (this.dog.ball.playerHasBall) {
      // If currently sitting
      if (this.dog.animator.currentAnimation === AnimationAsset.Sitting) {
        // Can stand up
        this.dog.animator.play(AnimationAsset.SitToStand); // (automatically plays Standing anim after this ends)
      }
    }
  }
}
