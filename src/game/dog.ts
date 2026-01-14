import * as THREE from "three";
import { AnimationAsset, AssetManager, ModelAsset } from "./asset-manager";
import { Dogs } from "./types";
import { Ball } from "./ball";

enum DogState {
  Fetching,
  Returning,
  Waiting,
  Following,
}

export class Dog extends THREE.Object3D {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  private state: DogState = DogState.Waiting;

  private jawBone?: THREE.Object3D;
  private readonly ballHoldPosition = new THREE.Vector3(0, -5, 15);

  constructor(
    private assetManager: AssetManager,
    private camera: THREE.PerspectiveCamera,
    private ball: Ball,
    private scene: THREE.Scene
  ) {
    super();

    // Setup mesh
    const dogs = this.assetManager.getModel(ModelAsset.DOGS);
    dogs.scale.multiplyScalar(0.01);
    showDog(dogs, "SK_Animal_Dog_GoldenRetriever_Collar_01");
    hideDogExtras(dogs);
    this.add(dogs);

    // Animations
    this.mixer = new THREE.AnimationMixer(dogs);
    this.setupAnimations();
    this.mixer.addEventListener("finished", this.onFinishAnimation);

    this.playAnimation(AnimationAsset.Sitting);

    // Get a reference to the jaw bone for holding the ball
    const boneParent = dogs.children[1];
    this.jawBone = boneParent.getObjectByName("jaw_C0_0_joint"); // might not work with other dog types
  }

  tilAnimFinish(name: AnimationAsset) {
    return new Promise<void>((resolve) => {
      const onFinish = (event: { action: THREE.AnimationAction }) => {
        if (event.action.getClip().name !== name) return;

        this.mixer.removeEventListener("finished", onFinish);

        resolve();
      };

      this.mixer.addEventListener("finished", onFinish);

      this.playAnimation(name);
    });
  }

  isCurrentAnimation(name: AnimationAsset) {
    return this.currentAction?.getClip().name === name;
  }

  get currentAnimation() {
    return this.currentAction?.getClip().name;
  }

  get moveSpeed() {
    // Depends on current animation
    if (this.isCurrentAnimation(AnimationAsset.Walking)) return 2.5;
    if (this.isCurrentAnimation(AnimationAsset.Running)) return 5;

    return 3;
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

  fetch() {
    this.state = DogState.Fetching;
  }

  update(dt: number) {
    this.mixer.update(dt);

    switch (this.state) {
      case DogState.Waiting:
        this.waitForThrow();
        break;
      case DogState.Following:
        this.followPlayer();
        break;
      case DogState.Fetching:
        this.fetchBall(dt);
        break;
      case DogState.Returning:
        this.returnWithBall(dt);
        break;
    }
  }

  private waitForThrow() {
    // TODO Randomly perform some animations / sfx

    // TODO see if I can only change anim as/when rather than every frame...
    if (this.isCurrentAnimation(AnimationAsset.Walking)) {
      this.playAnimation(AnimationAsset.StandToSit);
    }

    // TODO should probably follow player if they move away too far...
  }

  private followPlayer() {
    // TODO stand, pickup ball, walk after player, drop ball, sit and wait
  }

  private async fetchBall(dt: number) {
    // If close enough to ball and not already in the process of grabbing it
    if (
      this.isCloseEnoughToBall() &&
      !this.isCurrentAnimation(AnimationAsset.HeadDown)
    ) {
      // Play head down animation, then pickup ball
      await this.tilAnimFinish(AnimationAsset.HeadDown);
      this.pickupBall();
      this.state = DogState.Returning;
      return;
    }

    switch (this.currentAnimation) {
      case AnimationAsset.Sitting:
        this.playAnimation(AnimationAsset.SitToStand);
        break;
      case AnimationAsset.Standing:
        this.playAnimation(AnimationAsset.Walking);
        break;
      case AnimationAsset.Walking:
        // If ball is far enough, start running
        // Must make sure the walk anim has looped at least once before switching to run
        break;
    }

    // Move towards the ball
    this.moveTowardsPosition(this.ball.renderComponent.position, dt);
  }

  private isCloseEnoughToBall() {
    return this.position.distanceTo(this.ball.renderComponent.position) < 1;
  }

  private pickupBall() {
    // Stop ball physics, parent to dog
    this.ball.stopPhysics();
    this.ball.renderComponent.position.set(0, 0, 0);

    this.jawBone?.add(this.ball.renderComponent);
    this.ball.renderComponent.position.copy(this.ballHoldPosition);
    this.ball.renderComponent.scale.multiplyScalar(100); // because dog scale is 0.01
  }

  private returnWithBall(dt: number) {
    // Return to player's position
    if (this.isCloseEnoughToPlayer()) {
      this.dropBall();
      this.state = DogState.Waiting;
      return;
    }

    this.playAnimation(AnimationAsset.Walking);

    // TODO start walking when close enough, then drop
    this.moveTowardsPosition(this.camera.position, dt);
  }

  private isCloseEnoughToPlayer() {
    return this.position.distanceTo(this.camera.position) < 3;
  }

  private dropBall() {
    // Unparent ball from dog, restart physics
    const worldPosition = new THREE.Vector3();
    this.ball.renderComponent.getWorldPosition(worldPosition);
    this.jawBone?.remove(this.ball.renderComponent);
    this.scene.add(this.ball.renderComponent);
    this.ball.renderComponent.scale.multiplyScalar(0.01);

    this.ball.physicsBody.position.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );
    this.ball.restartPhysics();
  }

  private canMove() {
    return (
      this.currentAnimation === AnimationAsset.Walking ||
      this.currentAnimation === AnimationAsset.Running
    );
  }

  private moveTowardsPosition(position: THREE.Vector3, dt: number) {
    if (!this.canMove()) return;

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

  private onFinishAnimation = (event: { action: THREE.AnimationAction }) => {
    // This makes sure the right loop anim is played after the corresponding transition anim
    const name = event.action.getClip().name;

    switch (name) {
      case AnimationAsset.SitToStand:
        this.playAnimation(AnimationAsset.Standing);
        break;
      case AnimationAsset.StandToSit:
        this.playAnimation(AnimationAsset.Sitting);
        break;
      case AnimationAsset.HeadDown:
        // After head down, dog should be holding the ball now, so stand up
        this.playAnimation(AnimationAsset.Standing);
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
    this.createActionFor(AnimationAsset.HeadDown, {
      loopOnce: true,
      clampWhenFinished: true,
    });
    this.createActionFor(AnimationAsset.Walking, { ignoreRootMotion: true });
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

function getDog(topdog: THREE.Object3D, name: string) {
  // The top-level object is a group with two children; a Group named 'mesh', and a Bone
  const meshGroup = topdog.children[0];

  // The mesh group has 18 children, all groups with Dogs being the first and attachments/other stuff in the rest
  const dogsGroup = meshGroup.children[0];

  // The dogs group has 28 skinned mesh children, each represents a dog
  return dogsGroup.getObjectByName(name);
}

function showDog(topdog: THREE.Object3D, name: string) {
  // The top-level object is a group with two children; a Group named 'mesh', and a Bone
  const meshGroup = topdog.children[0];

  // The mesh group has 18 children, all groups with Dogs being the first and attachments/other stuff in the rest
  const dogsGroup = meshGroup.children[0];

  // The dogs group has 28 skinned mesh children, each represents a dog
  dogsGroup.children.forEach((child) => (child.visible = false));
  const dog = dogsGroup.getObjectByName(name);
  if (dog) dog.visible = true;
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
