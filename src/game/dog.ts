import * as THREE from "three";
import {
  AnimationAsset,
  AssetManager,
  ModelAsset,
  TextureAsset,
} from "./asset-manager";
import { Dogs } from "./types";

export class Dog extends THREE.Object3D {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(private assetManager: AssetManager) {
    super();

    // Setup mesh
    const dogs = this.assetManager.getModel(ModelAsset.DOGS);
    dogs.scale.multiplyScalar(0.01);
    getDog(dogs, Dogs.GoldenRetrieverCollar);
    hideDogExtras(dogs);
    this.add(dogs);

    // Animations
    this.mixer = new THREE.AnimationMixer(dogs);
    this.setupAnimations();
  }

  playAnimation(name: AnimationAsset) {
    // Find the new action with the given name
    const nextAction = this.actions.get(name);
    if (!nextAction) {
      throw Error(
        "Could not find action with name " + name + "for character " + this
      );
    }

    // Reset the next action then fade to it from the current action
    nextAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);

    this.currentAction
      ? nextAction.crossFadeFrom(this.currentAction, 0.25, false).play()
      : nextAction.play();

    // Next is now current
    this.currentAction = nextAction;
  }

  update(dt: number) {
    this.mixer.update(dt);
  }

  private setupAnimations() {
    this.createActionFor(AnimationAsset.Sitting);
    this.createActionFor(AnimationAsset.Running, { ignoreRootMotion: true });
  }

  private createActionFor(
    anim: AnimationAsset,
    options?: { ignoreRootMotion: boolean }
  ) {
    const clip = this.assetManager.animations.get(anim);
    if (!clip) return;

    if (options?.ignoreRootMotion) {
      clip.tracks[0].values = new Float32Array();
    }

    const action = this.mixer.clipAction(clip);

    this.actions.set(anim, action);
  }
}

function getDog(topdog: THREE.Object3D, dog: Dogs) {
  // The top-level object is a group with two children; a Group named 'mesh', and a Bone
  const meshGroup = topdog.children[0];

  // The mesh group has 18 children, all groups with Dogs being the first and attachments/other stuff in the rest
  const dogsGroup = meshGroup.children[0];

  // The dogs group has 28 skinned mesh children, each represents a dog

  // Make all dogs invisible, then make the required one visible
  dogsGroup.children.forEach((child) => (child.visible = false));
  dogsGroup.children[dog].visible = true;
}

function hideDogExtras(topdog: THREE.Object3D) {
  // The top-level object is a group with two children; a Group named 'mesh', and a Bone
  const meshGroup = topdog.children[0];

  // The mesh group has 18 children, all groups with Dogs being the first and attachments/other stuff in the rest

  // Iterate over all but the dogs group and turn invisible
  for (let i = 1; i < meshGroup.children.length; i++) {
    meshGroup.children[i].visible = false;
  }
}
