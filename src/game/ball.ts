import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicsObject } from "./physics-object";

// export class Ball extends THREE.Object3D {
//   restingOnGround = false;

//   constructor(assetManager: AssetManager) {
//     super();

//     const ball = assetManager.getModel(ModelAsset.Ball);
//     assetManager.applyModelTexture(ball, TextureAsset.Dog);
//     ball.scale.multiplyScalar(0.01);
//     this.add(ball);
//   }

//   restOnGround() {
//     const bounds = new THREE.Box3().setFromObject(this);
//     const size = bounds.getSize(new THREE.Vector3());
//     this.position.y += size.y / 2;
//     this.restingOnGround = true;
//   }
// }

export class Ball extends PhysicsObject {
  constructor() {
    const radius = 0.05;

    const physicsBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(radius),
    });

    const renderComponent = new THREE.Mesh(
      new THREE.SphereGeometry(radius),
      new THREE.MeshNormalMaterial()
    );

    super(physicsBody, renderComponent);
  }
}
