import * as THREE from "three";
import { AnimationAsset, AssetManager, ModelAsset } from "./asset-manager";
import { Dogs } from "./types";

export class Dog extends THREE.Object3D {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  private targetPos?: THREE.Vector3;
  private moveSpeed = 1;

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
    this.mixer.addEventListener("finished", this.onFinishAnimation);

    this.playAnimation(AnimationAsset.Sitting);
  }

  isCurrentAnimation(name: AnimationAsset) {
    return this.currentAction?.getClip().name === name;
  }

  playAnimation(name: AnimationAsset, fadeDuration: number = 0.25) {
    if (this.isCurrentAnimation(name)) return;

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
      ? nextAction.crossFadeFrom(this.currentAction, fadeDuration, false).play()
      : nextAction.play();

    // Next is now current
    this.currentAction = nextAction;
  }

  standUp() {
    if (this.isCurrentAnimation(AnimationAsset.Sitting)) {
      this.playAnimation(AnimationAsset.SitToStand);
    }
  }

  moveTo(pos: THREE.Vector3) {
    // One at a time, can't interrupt
    if (this.targetPos) return;

    this.targetPos = pos;

    // If already standing, start running
    if (this.isCurrentAnimation(AnimationAsset.Standing)) {
      this.playAnimation(AnimationAsset.Running);
    }
  }

  update(dt: number) {
    this.mixer.update(dt);

    // Move towards target
    this.moveTowardsTarget(dt);
  }

  private moveTowardsTarget(dt: number) {
    if (!this.targetPos) return;

    // Can't move when transitioning to a stand
    if (this.isCurrentAnimation(AnimationAsset.SitToStand)) return;

    const direction = this.targetPos.clone().sub(this.position).normalize();
    this.position.add(direction.multiplyScalar(this.moveSpeed * dt));

    // If close enough, stop
    if (this.position.distanceTo(this.targetPos) < 0.01) {
      this.targetPos = undefined;
    }
  }

  private onFinishAnimation = (event: { action: THREE.AnimationAction }) => {
    const name = event.action.getClip().name;

    if (name === AnimationAsset.SitToStand) {
      // If there is a target already then start running
      this.playAnimation(
        this.targetPos ? AnimationAsset.Running : AnimationAsset.Standing
      );
    }
  };

  private setupAnimations() {
    this.createActionFor(AnimationAsset.Sitting);
    this.createActionFor(AnimationAsset.Running, { ignoreRootMotion: true });
    this.createActionFor(AnimationAsset.RunningJump, {
      ignoreRootMotion: true,
      loopOnce: true,
      clampWhenFinished: true,
    });
    this.createActionFor(AnimationAsset.Standing);
    this.createActionFor(AnimationAsset.SitToStand, {
      loopOnce: true,
      clampWhenFinished: true,
    });
  }

  private createActionFor(
    anim: AnimationAsset,
    options?: {
      ignoreRootMotion?: boolean;
      loopOnce?: boolean;
      clampWhenFinished?: boolean;
    }
  ) {
    const clip = this.assetManager.animations.get(anim);
    if (!clip) return;

    clip.name = anim.toString();

    if (options?.ignoreRootMotion) {
      clip.tracks[0].values = new Float32Array();
    }

    const action = this.mixer.clipAction(clip);

    if (options?.loopOnce) {
      action.setLoop(THREE.LoopOnce, 1);
    }
    if (options?.clampWhenFinished) {
      action.clampWhenFinished = true;
    }

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
