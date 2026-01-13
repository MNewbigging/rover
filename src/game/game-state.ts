import * as CANNON from "cannon-es";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { Dog } from "./dog";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { Ball } from "./ball";
import { Ground } from "./ground";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: PointerLockControls;
  private keyboardListener = new KeyboardListener();
  private raycaster = new THREE.Raycaster();

  private moveSpeed = 2;
  private holdingBall = false;
  private dog: Dog;
  private ground: Ground;
  private ball: Ball;

  private physicsWorld = new CANNON.World();

  private reused = {
    ndc: new THREE.Vector2(),
  };

  constructor(private assetManager: AssetManager) {
    // High level setup
    this.setupCamera();
    this.renderPipeline = new RenderPipeline(this.scene, this.camera);
    this.setupLights();
    this.scene.background = new THREE.Color("#1680AF");

    // Controls
    this.controls = new PointerLockControls(
      this.camera,
      this.renderPipeline.canvas
    );
    this.scene.add(this.controls.getObject());
    this.controls.lock();

    // Ground
    this.ground = new Ground();
    this.scene.add(this.ground.renderComponent);

    // Ball
    this.ball = new Ball(this.physicsWorld, assetManager);
    this.scene.add(this.ball.renderComponent);
    this.ball.position = { x: 0, y: 1, z: 0.3 };

    // Doggo
    this.dog = new Dog(assetManager, this.camera, this.ball);
    this.scene.add(this.dog);

    // Physics
    this.physicsWorld.gravity.set(0, -9.82, 0);
    this.physicsWorld.defaultContactMaterial.restitution = 0.75;
    this.physicsWorld.addBody(this.ball.physicsBody);
    this.physicsWorld.addBody(this.ground.physicsBody);

    // Listeners
    window.addEventListener("click", this.onClick);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);

    // Start game
    this.update();
  }

  private setupCamera() {
    this.camera.fov = 75;
    this.camera.far = 500;
    this.camera.position.set(0, 1.5, 3);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 1);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.dog.update(dt);

    this.movePlayer(dt);

    this.highlightBall();

    this.physicsWorld.fixedStep();

    this.ball.update();

    this.renderPipeline.render(dt);
  };

  private movePlayer(dt: number) {
    const moveForward = this.keyboardListener.isKeyPressed("w");
    const moveBackward = this.keyboardListener.isKeyPressed("s");
    const moveLeft = this.keyboardListener.isKeyPressed("a");
    const moveRight = this.keyboardListener.isKeyPressed("d");

    const direction = new THREE.Vector3();
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // avoid moving faster on diagonals

    this.controls.moveForward(direction.z * this.moveSpeed * dt);
    this.controls.moveRight(direction.x * this.moveSpeed * dt);
  }

  private highlightBall() {
    this.renderPipeline.clearOutlines();

    if (this.isCloseEnoughToPickupBall() && this.isLookingAtBall()) {
      this.renderPipeline.outlineObject(this.ball.renderComponent);
    }
  }

  private isLookingAtBall() {
    this.raycaster.setFromCamera(this.reused.ndc, this.camera);

    const intersections = this.raycaster.intersectObject(
      this.ball.renderComponent
    );

    return !!intersections.length;
  }

  private isCloseEnoughToPickupBall() {
    return (
      this.camera.position.distanceTo(this.ball.renderComponent.position) < 2
    );
  }

  private onClick = (e: MouseEvent) => {
    if (!isLeftClick(e)) return;
    if (this.holdingBall) return;
    if (!this.isLookingAtBall()) return;
    if (!this.isCloseEnoughToPickupBall()) return;

    this.pickUpBall();
  };

  private pickUpBall() {
    // Stop updating ball with physics body properties in update loop
    this.ball.stopPhysics();

    // Parent ball mesh to camera
    const ballMesh = this.ball.renderComponent;
    ballMesh.position.set(0, 0, 0);
    this.camera.add(ballMesh);
    ballMesh.position.set(0.3, 0, -1);

    // Now holding the ball ( this flag allows throwing logic )
    this.holdingBall = true;
  }

  private onMouseDown = (e: MouseEvent) => {
    if (!isLeftClick(e)) return;
    if (!this.holdingBall) return;

    this.dog.standUp();
  };

  private onMouseUp = (e: MouseEvent) => {
    if (!isLeftClick(e)) return;
    if (!this.holdingBall) return;

    this.throwBall();
  };

  private throwBall = () => {
    const ballMesh = this.ball.renderComponent;

    // Get ball mesh's world position at time of release
    const worldPosition = new THREE.Vector3();
    ballMesh.getWorldPosition(worldPosition);

    // Unparent ball from the camera, add it back to the scene
    this.camera.remove(ballMesh);
    this.scene.add(ballMesh);

    // Update physics body with world position
    this.ball.physicsBody.position.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );

    // Give it an impulse in the facing direction
    const worldDirection = new THREE.Vector3();
    this.camera.getWorldDirection(worldDirection);
    worldDirection.multiplyScalar(1);
    this.ball.physicsBody.applyImpulse(asVec3(worldDirection));

    // No longer holding it; update ball with physics props
    this.ball.restartPhysics();
    this.holdingBall = false;

    // Tell dog to fetch - might need a delay here
    this.dog.fetch();
  };
}

function asVec3(v: THREE.Vector3) {
  return new CANNON.Vec3(v.x, v.y, v.z);
}

function isLeftClick(e: MouseEvent) {
  return e.button === 0;
}
