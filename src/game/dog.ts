import * as THREE from "three";
import { AnimationAsset, AssetManager, ModelAsset } from "./asset-manager";
import { Dogs } from "./types";

export class Dog extends THREE.Object3D {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  private startPos = new THREE.Vector3(); // for now
  private ballPos?: THREE.Vector3;
  private moveSpeed = 1;

  private hasBall = false;

  constructor(
    private assetManager: AssetManager,
    private camera: THREE.PerspectiveCamera
  ) {
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

  fetch(ballPos: THREE.Vector3) {
    if (this.ballPos) return;

    this.ballPos = ballPos;

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
    // Waiting at start point for ball to be thrown
    if (!this.hasBall && !this.ballPos) return; // nothing to move towards

    // Fetching the ball
    if (!this.hasBall && this.ballPos) {
      this.moveTowardsBall(this.ballPos, dt);
      return;
    }

    // Returning to start point with the ball
    if (this.hasBall) this.moveToStartPos(dt);
  }

  private moveTowardsBall(ballPos: THREE.Vector3, dt: number) {
    // Can't move when transitioning to a stand
    if (this.isCurrentAnimation(AnimationAsset.SitToStand)) return;

    const direction = ballPos.clone().sub(this.position).normalize();
    const nextPos = this.position
      .clone()
      .add(direction.multiplyScalar(this.moveSpeed * dt));

    // For now until I get turning/bending implemented
    this.lookAt(nextPos);
    this.position.copy(nextPos);

    // If close enough, pick up the ball
    if (this.position.distanceTo(ballPos) < 0.01) {
      this.ballPos = undefined; // because it's in the dog's mouth!
      this.hasBall = true;
    }
  }

  private moveToStartPos(dt: number) {
    const direction = this.startPos.clone().sub(this.position).normalize();
    const nextPos = this.position
      .clone()
      .add(direction.multiplyScalar(this.moveSpeed * dt));

    this.lookAt(nextPos);
    this.position.copy(nextPos);

    // If close enough, drop the ball and sit down
    if (this.position.distanceTo(this.startPos) < 0.01) {
      this.hasBall = false;
      this.playAnimation(AnimationAsset.StandToSit);
      // TODO face player
    }
  }

  private onFinishAnimation = (event: { action: THREE.AnimationAction }) => {
    const name = event.action.getClip().name;

    if (name === AnimationAsset.SitToStand) {
      // If there is a target already then start running
      this.playAnimation(
        this.ballPos ? AnimationAsset.Running : AnimationAsset.Standing
      );
    }

    if (name === AnimationAsset.StandToSit) {
      this.playAnimation(AnimationAsset.Sitting);
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
    this.createActionFor(AnimationAsset.StandToSit, {
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
