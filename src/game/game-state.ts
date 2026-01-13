import * as CANNON from "cannon-es";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { Dog } from "./dog";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { Ball } from "./ball";
import { Ground } from "./ground";

/**
 * The idea for this game:
 * - Scene shows a dog in a garden/park/green space
 * - Player must throw a ball for the dog
 * - Dog goes to get the ball
 * - In first person
 */
export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: PointerLockControls;
  private keyboardListener = new KeyboardListener();
  private raycaster = new THREE.Raycaster();

  private moveSpeed = 2;
  private highlightingBall = false;
  private holdingBall = false;
  private dog: Dog;
  private ground: Ground;
  private ball: Ball;

  private thrownBalls: Ball[] = [];

  private physicsWorld: CANNON.World;

  constructor(private assetManager: AssetManager) {
    this.setupCamera();
    this.renderPipeline = new RenderPipeline(this.scene, this.camera);
    this.setupLights();

    this.controls = new PointerLockControls(
      this.camera,
      this.renderPipeline.canvas
    );
    this.scene.add(this.controls.getObject());
    this.controls.lock();

    this.scene.background = new THREE.Color("#1680AF");

    // Ground
    this.ground = new Ground();
    this.scene.add(this.ground.renderComponent);

    // Doggo
    this.dog = new Dog(assetManager, this.camera);
    this.scene.add(this.dog);

    // Ball
    this.ball = new Ball(assetManager);
    this.scene.add(this.ball.renderComponent);
    this.ball.position = { x: 0, y: 1, z: 0.3 };

    // Physics
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    this.physicsWorld.defaultContactMaterial.restitution = 0.75;
    this.physicsWorld.addBody(this.ball.physicsBody);
    this.physicsWorld.addBody(this.ground.physicsBody);

    // Listeners
    window.addEventListener("click", this.throwBall);

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

    this.thrownBalls.forEach((ball) => ball.update());

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
    this.highlightingBall = false;

    const ndc = new THREE.Vector2(0); // always in the middle since it's fps controls
    this.raycaster.setFromCamera(ndc, this.camera);

    const intersections = this.raycaster.intersectObject(
      this.ball.renderComponent
    );
    if (intersections.length) {
      this.renderPipeline.outlineObject(this.ball.renderComponent);
      this.highlightingBall = true;
    }
  }

  private onClick = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (!this.highlightingBall) return;

    this.camera.add(this.ball.renderComponent);
    this.ball.position = { x: 0.25, y: 0, z: -1 };
    this.holdingBall = true;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.dog.standUp();
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) return;

    //
  };

  private throwBall = () => {
    // Create a new ball
    const ball = new Ball(this.assetManager);

    // Add it to scene and array and physics world
    this.scene.add(ball.renderComponent);
    this.thrownBalls.push(ball);
    this.physicsWorld.addBody(ball.physicsBody);

    // Set its starting position
    const worldPosition = new THREE.Vector3();
    this.camera.getWorldPosition(worldPosition);
    ball.position = worldPosition;

    // Give it an impulse in the facing direction
    const worldDirection = new THREE.Vector3();
    this.camera.getWorldDirection(worldDirection);

    worldDirection.multiplyScalar(1);

    ball.physicsBody.applyImpulse(asVec3(worldDirection));
  };
}

function asVec3(v: THREE.Vector3) {
  return new CANNON.Vec3(v.x, v.y, v.z);
}
