import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { Dog } from "./dog";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { Ball } from "./ball";

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
  private ground: THREE.Mesh;
  private ball: Ball;

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

    // Scene
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: "green" })
    );
    ground.rotateX(-Math.PI / 2);
    this.scene.add(ground);
    this.ground = ground;

    // Doggo
    this.dog = new Dog(assetManager, this.camera);
    this.scene.add(this.dog);

    // Ball
    this.ball = new Ball(assetManager);
    this.scene.add(this.ball);
    this.ball.restOnGround();
    this.ball.position.z += 0.3; // just in front of dog TODO do this automagically somehow?

    // Listeners
    window.addEventListener("click", this.onClick);
    //window.addEventListener("pointerdown", this.onMouseDown);
    //window.addEventListener("pointerup", this.onMouseUp);

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
    if (!this.ball.restingOnGround) return;

    this.renderPipeline.clearOutlines();
    this.highlightingBall = false;

    const ndc = new THREE.Vector2(0); // always in the middle since it's fps controls
    this.raycaster.setFromCamera(ndc, this.camera);

    const intersections = this.raycaster.intersectObject(this.ball);
    if (intersections.length) {
      this.renderPipeline.outlineObject(this.ball);
      this.highlightingBall = true;
    }
  }

  private onClick = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (!this.highlightingBall) return;

    this.camera.add(this.ball);
    this.ball.position.z -= 1;
    this.ball.position.x += 0.25;
    this.holdingBall = true;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.dog.standUp();
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) return;

    // Get ndc
    const ndc = new THREE.Vector2();
    ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Raycast against ground
    this.raycaster.setFromCamera(ndc, this.camera);
    const intersections = this.raycaster.intersectObject(this.ground);
    if (!intersections.length) return;

    // Get clicked position
    const pos = intersections[0].point;
    this.dog.fetch(pos);
  };
}
