import * as THREE from "three";
import { DogAnimator } from "./dog-animator";
import { AnimationAsset, AssetManager } from "../asset-manager";
import { Ball } from "../ball";
import { buildDog } from "./dog-builder";

export class NewDog extends THREE.Object3D {
  animator: DogAnimator;
  jawBone?: THREE.Object3D;
  readonly ballHoldPosition = new THREE.Vector3(0, -5, 15);

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
  }

  get moveSpeed() {
    // Depends on current animation
    if (this.animator.isCurrentAnimation(AnimationAsset.Walking)) return 2.5;
    if (this.animator.isCurrentAnimation(AnimationAsset.Running)) return 5;

    return 3;
  }

  update(dt: number) {
    this.animator.update(dt);
  }
}
