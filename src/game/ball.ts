import * as THREE from "three";
import { AssetManager, ModelAsset, TextureAsset } from "./asset-manager";

export class Ball extends THREE.Object3D {
  constructor(assetManager: AssetManager) {
    super();

    const ball = assetManager.getModel(ModelAsset.Ball);
    assetManager.applyModelTexture(ball, TextureAsset.Dog);
    ball.scale.multiplyScalar(0.01);
    this.add(ball);
  }
}
