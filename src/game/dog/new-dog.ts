import * as THREE from "three";
import { DogAnimator } from "./dog-animator";
import { AnimationAsset, AssetManager } from "../asset-manager";
import { Ball } from "../ball";
import { buildDog } from "./dog-builder";
import { DogGoal, DogGoalName } from "./goals/dog-goal";
import { WaitGoal } from "./goals/wait-goal";
import { ReturnGoal } from "./goals/return-goal";
import { FetchGoal } from "./goals/fetch-goal";
import { FollowGoal } from "./goals/follow-goal";

export class NewDog extends THREE.Object3D {
  animator: DogAnimator;
  jawBone?: THREE.Object3D;
  readonly ballHoldPosition = new THREE.Vector3(0, -5, 15);

  readonly followThreshold = 6; // metres away from player before start to follow
  readonly waitThreshold = 3; // metres away from player bofore start to wait

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

    const nextGoalName = this.currentGoal.getNextGoalName();
    if (nextGoalName) {
      "next goal should be", nextGoalName;
      if (this.currentGoal.canFinish()) {
        this.currentGoal = this.createNextGoal(nextGoalName);
        this.currentGoal.setupBehaviours();
      } else {
        ("but current goal cannot finish");
      }
    }

    this.currentGoal.update(dt);
  }

  private createNextGoal(name: DogGoalName) {
    switch (name) {
      case "wait":
        return new WaitGoal(this);
      case "follow":
        return new FollowGoal(this);
      case "fetch":
        return new FetchGoal(this);
      case "return":
        return new ReturnGoal(this);
    }
  }
}
