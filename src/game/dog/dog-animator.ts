import * as THREE from "three";
import { AnimationAsset, AssetManager } from "../asset-manager";

export class DogAnimator {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(private assetManager: AssetManager, dogModel: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(dogModel);
    this.setupAnimations();
    this.mixer.addEventListener("finished", this.onFinishAnimation);
  }

  isCurrentAnimation(name: AnimationAsset) {
    return this.currentAction?.getClip().name === name;
  }

  get currentAnimation() {
    return this.currentAction?.getClip().name;
  }

  playUntilFinish(name: AnimationAsset): Promise<void> {
    return new Promise<void>((resolve) => {
      const onFinish = (event: { action: THREE.AnimationAction }) => {
        if (event.action.getClip().name !== name) return;

        this.mixer.removeEventListener("finished", onFinish);
        resolve();
      };

      this.mixer.addEventListener("finished", onFinish);
      this.play(name);
    });
  }

  playForLoops(name: AnimationAsset, loopCount: number) {
    return new Promise<void>((resolve) => {
      let loops = 0;

      const onLoop = (event: { action: THREE.AnimationAction }) => {
        if (event.action.getClip().name !== name) return;

        loops++;
        if (loops === loopCount) {
          this.mixer.removeEventListener("loop", onLoop);
          resolve();
        }
      };

      this.mixer.addEventListener("loop", onLoop);
      this.play(name);
    });
  }

  play(name: AnimationAsset, fadeDuration: number = 0.25) {
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

  update(dt: number) {
    this.mixer.update(dt);
  }

  private onFinishAnimation = (event: { action: THREE.AnimationAction }) => {
    // This makes sure the right loop anim is played after the corresponding transition anim
    const name = event.action.getClip().name;

    switch (name) {
      case AnimationAsset.SitToStand:
        this.play(AnimationAsset.Standing);
        break;
      case AnimationAsset.StandToSit:
        this.play(AnimationAsset.Sitting);
        break;
      case AnimationAsset.HeadDownStanding:
        // todo should probably play this anim in reverse so head doesn't snap (or do a better fadeDuration?)
        // After head down, dog should be holding the ball now, so stand up
        this.play(AnimationAsset.Standing);
        break;
      case AnimationAsset.HeadDownSitting:
        this.play(AnimationAsset.Sitting);
        break;
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
    this.createActionFor(AnimationAsset.HeadDownStanding, {
      loopOnce: true,
      clampWhenFinished: true,
    });
    this.createActionFor(AnimationAsset.HeadDownSitting, {
      loopOnce: true,
      clampWhenFinished: true,
    });
    this.createActionFor(AnimationAsset.Walking, { ignoreRootMotion: true });
    this.createActionFor(AnimationAsset.TailWagSit, {});
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
