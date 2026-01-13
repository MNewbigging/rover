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

  private moveSpeed = 3;

  private state: DogState = DogState.Waiting;

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
    getDog(dogs, Dogs.GoldenRetrieverCollar);
    hideDogExtras(dogs);
    this.add(dogs);
    console.log(dogs);

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
        this.runTowardsBall(dt);
        break;
      case DogState.Returning:
        this.returnWithBall(dt);
        break;
    }
  }

  private waitForThrow() {
    // TODO Randomly perform some animations / sfx

    // TODO see if I can only change anim as/when rather than every frame...
    if (this.isCurrentAnimation(AnimationAsset.Running)) {
      this.playAnimation(AnimationAsset.StandToSit);
    }

    // TODO should probably follow player if they move away too far...
  }

  private followPlayer() {
    // TODO stand, pickup ball, walk after player, drop ball, sit and wait
  }

  private runTowardsBall(dt: number) {
    // If close enough to ball, grab it & can start to return
    if (this.isCloseEnoughToBall()) {
      this.pickupBall();
      this.state = DogState.Returning;
      return;
    }

    // Need to stand up if sitting, or run if already standing
    if (this.isCurrentAnimation(AnimationAsset.Sitting)) {
      // When this finishes, standing will automatically start
      this.playAnimation(AnimationAsset.SitToStand);
    } else if (this.isCurrentAnimation(AnimationAsset.Standing)) {
      this.playAnimation(AnimationAsset.Running);
    }

    // Move towards the ball
    this.moveTowardsPosition(this.ball.renderComponent.position, dt);
  }

  private isCloseEnoughToBall() {
    return this.position.distanceTo(this.ball.renderComponent.position) < 1;
  }

  private pickupBall() {
    console.log("Dog picked up ball");

    // Stop ball physics, parent to dog
    this.ball.stopPhysics();
    this.ball.renderComponent.position.set(0, 0, 0);
    this.add(this.ball.renderComponent); // todo need to put on dogs child object instead
    this.ball.renderComponent.position.set(0, 0.5, 1);
  }

  private returnWithBall(dt: number) {
    console.log("resturning with ball");

    // Return to player's position
    if (this.isCloseEnoughToPlayer()) {
      this.dropBall();
      this.state = DogState.Waiting;
      return;
    }

    // Should be running
    this.playAnimation(AnimationAsset.Running);

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
    this.remove(this.ball.renderComponent);
    this.scene.add(this.ball.renderComponent);

    this.ball.physicsBody.position.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );
    this.ball.restartPhysics();

    console.log("Dog dropped ball");
  }

  private moveTowardsPosition(position: THREE.Vector3, dt: number) {
    // Can only move towards ball if running
    if (!this.isCurrentAnimation(AnimationAsset.Running)) return;

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

    if (name === AnimationAsset.SitToStand) {
      this.playAnimation(AnimationAsset.Standing);
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
