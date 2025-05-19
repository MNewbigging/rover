import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AnimationAsset, AssetManager, ModelAsset } from "./asset-manager";
import { AnimatedObject } from "./animated-object";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  private topdog: THREE.Object3D;
  private mixer: THREE.AnimationMixer;

  constructor(private assetManager: AssetManager) {
    this.setupCamera();

    this.renderPipeline = new RenderPipeline(this.scene, this.camera);

    this.setupLights();

    this.controls = new OrbitControls(this.camera, this.renderPipeline.canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    this.scene.background = new THREE.Color("#1680AF");

    //this.scene.add(this.animatedObject);

    const dogs = this.assetManager.getModel(ModelAsset.DOGS);
    dogs.scale.multiplyScalar(0.01);

    // Hide all but one dog
    const mesh = dogs.children[0];
    const Dogs = mesh.children[0];

    for (let i = 1; i < Dogs.children.length; i++) {
      Dogs.children[i].visible = false;
    }

    // Hide all attachments
    for (let i = 1; i < mesh.children.length; i++) {
      mesh.children[i].visible = false;
    }

    this.scene.add(dogs);

    this.topdog = dogs;

    this.mixer = new THREE.AnimationMixer(this.topdog);

    const sittingClip = this.assetManager.animations.get(
      AnimationAsset.DogSitting
    )!;
    const sittingAction = this.mixer.clipAction(sittingClip);
    sittingAction.play();

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

    this.mixer.update(dt);

    this.renderPipeline.render(dt);
  };
}
