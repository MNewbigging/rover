import { AnimationAsset } from "../asset-manager";
import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";

// Might come from sitting, walking, running etc
// Needs to play head down anim, attach ball to dog
export class PickupBallBehaviour extends DogBehaviour {
  name = DogBehaviourName.PickupBall;

  async onStart() {
    const anim = this.dog.animator.currentAnimation;
    if (anim === AnimationAsset.Sitting) {
      await this.dog.animator.playUntilFInish(AnimationAsset.HeadDownSitting);
      this.pickupBall();
    }
  }

  canFinish(): boolean {
    // When no longer performing head down anim
    return (
      this.dog.animator.currentAnimation !== AnimationAsset.HeadDownSitting
    );
  }

  getNextBehaviourName(): DogBehaviourName {
    throw new Error("Method not implemented.");
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
  }
}
