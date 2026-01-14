import * as THREE from "three";
import { DogAnimator } from "./dog-animator";
import { AnimationAsset, AssetManager } from "../asset-manager";
import { Ball, BallState } from "../ball";
import { buildDog } from "./dog-builder";
import { DogGoal } from "./goals/dog-goal";
import { WaitGoal } from "./goals/wait-goal";
import { ReturnGoal } from "./goals/return-goal";
import { FetchGoal } from "./goals/fetch-goal";
import { FollowGoal } from "./goals/follow-goal";

export class NewDog extends THREE.Object3D {
  animator: DogAnimator;
  jawBone?: THREE.Object3D;
  readonly ballHoldPosition = new THREE.Vector3(0, -5, 15);

  currentGoal: DogGoal;

  constructor(
    public ball: Ball,
    public camera: THREE.PerspectiveCamera,
    public scene: THREE.Scene,
    assetManager: AssetManager
  ) {
    super();

    const dogModel = buildDog(
      "SK_Animal_Dog_GoldenRetriever_Collar_01",
      assetManager
    );
    this.animator = new DogAnimator(assetManager, dogModel);
    this.add(dogModel);

    // Get a reference to the jaw bone for holding the ball
    const boneParent = dogModel.children[1];
    this.jawBone = boneParent.getObjectByName("jaw_C0_0_joint"); // might not work with other dog types

    // Dog starts off sitting
    this.animator.play(AnimationAsset.Sitting);
    this.currentGoal = new WaitGoal(this);
    this.currentGoal.setupBehaviours();
  }

  get moveSpeed() {
    // Depends on current animation
    if (this.animator.isCurrentAnimation(AnimationAsset.Walking)) return 2.5;
    if (this.animator.isCurrentAnimation(AnimationAsset.Running)) return 5;

    return 3;
  }

  update(dt: number) {
    this.animator.update(dt);

    // Always be looking for the next goal
    const nextGoal = this.getNextGoal();

    // If it's different, and the current goal is done, change it
    if (
      nextGoal.name !== this.currentGoal.name &&
      this.currentGoal.canFinish()
    ) {
      this.currentGoal = nextGoal;
      this.currentGoal.setupBehaviours();
    }

    // Update the current goal
    this.currentGoal.update(dt);
  }

  private getNextGoal() {
    // Easy ones - always return after fetch and wait after return
    if (this.currentGoal.name === "fetch") return new ReturnGoal(this);
    if (this.currentGoal.name === "return") return new WaitGoal(this);

    // If the ball has been thrown, go get it
    if (this.ball.state === BallState.Thrown) return new FetchGoal(this);

    // Otherwise wait or follow player if they've moved away
    return this.playerNearby() ? new WaitGoal(this) : new FollowGoal(this);
  }

  private playerNearby() {
    return this.position.distanceTo(this.camera.position) <= 6;
  }
}
