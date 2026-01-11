import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { Dog } from "./dog";

/**
 * The idea for this game:
 * - Scene shows a dog in a garden/park/green space
 * - Player must throw a ball for the dog
 * - Dog goes to get the ball
 */
export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  private raycaster = new THREE.Raycaster();

  private dog: Dog;
  private ground: THREE.Mesh;

  constructor(private assetManager: AssetManager) {
    this.setupCamera();
    this.renderPipeline = new RenderPipeline(this.scene, this.camera);
    this.setupLights();

    this.controls = new OrbitControls(this.camera, this.renderPipeline.canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

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
    this.dog = new Dog(assetManager);
    this.scene.add(this.dog);

    // Listeners
    window.addEventListener("click", this.onClick);

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

    this.controls.update();

    this.dog.update(dt);

    this.renderPipeline.render(dt);
  };

  private onClick = (e: MouseEvent) => {
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
    this.dog.moveTo(pos);
  };
}
