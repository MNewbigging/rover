import * as THREE from "three";
import { AssetManager, ModelAsset, TextureAsset } from "./asset-manager";

export class Ball extends THREE.Object3D {
  restingOnGround = false;

  constructor(assetManager: AssetManager) {
    super();

    const ball = assetManager.getModel(ModelAsset.Ball);
    assetManager.applyModelTexture(ball, TextureAsset.Dog);
    ball.scale.multiplyScalar(0.01);
    this.add(ball);
  }

  restOnGround() {
    const bounds = new THREE.Box3().setFromObject(this);
    const size = bounds.getSize(new THREE.Vector3());
    this.position.y += size.y / 2;
    this.restingOnGround = true;
  }
}
