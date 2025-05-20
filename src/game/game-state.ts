import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AnimationAsset, AssetManager, ModelAsset } from "./asset-manager";
import { Dogs } from "./types";

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

    const dogs = this.assetManager.getModel(ModelAsset.DOGS);
    dogs.scale.multiplyScalar(0.01);

    getDog(dogs, Dogs.GoldenRetrieverCollar);

    hideDogExtras(dogs);

    this.scene.add(dogs);

    this.topdog = dogs;
    console.log("topdog", this.topdog);

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
