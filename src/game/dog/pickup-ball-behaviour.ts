import { AnimationAsset } from "../asset-manager";
import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";

// Might come from sitting, walking, running etc
// Needs to play head down anim, attach ball to dog
export class PickupBallBehaviour extends DogBehaviour {
  name = DogBehaviourName.PickupBall;

  private pickedUpBall = false;

  async onStart() {
    const anim = this.dog.animator.currentAnimation;
    if (anim === AnimationAsset.Sitting) {
      await this.dog.animator.playUntilFInish(AnimationAsset.HeadDownSitting);
      this.pickupBall();
    }
  }

  canFinish(): boolean {
    // Once ball pickup below has finished
    return this.pickedUpBall;
  }

  getNextBehaviourName(): DogBehaviourName {
    // Can either go into a follow with ball or return with ball - but how do we know?
    // Should this be a sub-behavour?

    // note this isn't used right now
    return DogBehaviourName.FollowWithBall;
  }

  update(dt: number): void {
    // Do nothing!
  }

  private pickupBall() {
    // Stop ball physics, parent to dog
    const ball = this.dog.ball;
    ball.stopPhysics();
    ball.renderComponent.position.set(0, 0, 0);

    this.dog.jawBone?.add(ball.renderComponent);
    ball.renderComponent.position.copy(this.dog.ballHoldPosition);
    ball.renderComponent.scale.multiplyScalar(100); // because dog scale is 0.01

    this.pickedUpBall;
  }
}
