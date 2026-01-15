import { AnimationAsset } from "../../asset-manager";
import { BallState } from "../../ball";
import { DogBehaviour } from "./dog-behaviour";

export class PickupBehaviour extends DogBehaviour {
  async onStart() {
    console.log("start pickup behaviour");

    const anim = this.dog.animator.currentAnimation;
    // todo can remove, will only ever pickup from standing
    if (anim === AnimationAsset.Sitting) {
      await this.dog.animator.playUntilFInish(AnimationAsset.HeadDownSitting);
      this.pickupBall();
    } else {
      await this.dog.animator.playUntilFInish(AnimationAsset.HeadDownStanding);
      this.pickupBall();
    }
  }

  canFinish(): boolean {
    // Once ball pickup below has finished
    return this.dog.ball.state === BallState.WithDog;
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

    this.dog.ball.state = BallState.WithDog;
  }
}
