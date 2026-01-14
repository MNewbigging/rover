import * as THREE from "three";
import { DogAnimator } from "./dog-animator";
import { AnimationAsset, AssetManager } from "../asset-manager";
import { buildDog } from "../dog-builder";
import { Ball } from "../ball";
import { DogBehaviour, DogBehaviourName } from "./dog-behaviour";
import { WaitingBehaviour } from "./waiting-behaviour";
import { FollowWithoutBallBehaviour } from "./follow-without-ball-behaviour";

export class NewDog extends THREE.Object3D {
  animator: DogAnimator;

  currentBehaviour: DogBehaviour;

  jawBone?: THREE.Object3D;
  readonly ballHoldPosition = new THREE.Vector3(0, -5, 15);

  constructor(
    public ball: Ball,
    public camera: THREE.PerspectiveCamera,
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

    // Manually setup first behaviour
    this.currentBehaviour = new WaitingBehaviour(this);
    this.animator.play(AnimationAsset.Sitting);
  }

  get moveSpeed() {
    // Depends on current animation
    if (this.animator.isCurrentAnimation(AnimationAsset.Walking)) return 2.5;
    if (this.animator.isCurrentAnimation(AnimationAsset.Running)) return 5;

    return 3;
  }

  update(dt: number) {
    this.animator.update(dt);

    if (this.currentBehaviour.canFinish()) {
      const nextBehaviourName = this.currentBehaviour.getNextBehaviourName();
      const nextBehaviour = this.getNextBehaviour(nextBehaviourName);
      if (nextBehaviour) {
        this.currentBehaviour.onFinish();
        this.currentBehaviour = nextBehaviour;
        this.currentBehaviour.onStart();
      }
    } else {
      this.currentBehaviour.update(dt);
    }
  }

  getNextBehaviour(name: DogBehaviourName) {
    switch (name) {
      case DogBehaviourName.Fetching:
        break;
      case DogBehaviourName.FollowWithBall:
        break;
      case DogBehaviourName.FollowWithoutBall:
        return new FollowWithoutBallBehaviour(this);
      case DogBehaviourName.Returning:
        break;
      case DogBehaviourName.Waiting:
        return new WaitingBehaviour(this);
    }
  }

  moveTowardsPosition(position: THREE.Vector3, dt: number) {
    const direction = position.clone().sub(this.position).normalize();
    const nextPos = this.position
      .clone()
      .add(direction.multiplyScalar(this.moveSpeed * dt));

    // Ensure dog stays on the floor (will move upwards when running towards camera pos)
    nextPos.y = 0;

    // TODO get the bending/turning animations working
    this.lookAt(nextPos);
    this.position.copy(nextPos);
  }
}
