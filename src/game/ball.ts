import * as CANNON from "cannon-es";
import { PhysicsObject } from "./physics-object";
import { AssetManager, ModelAsset, TextureAsset } from "./asset-manager";

export class Ball extends PhysicsObject {
  constructor(private physicsWorld: CANNON.World, assetManager: AssetManager) {
    const renderComponent = assetManager.getModel(ModelAsset.Ball);
    assetManager.applyModelTexture(renderComponent, TextureAsset.Dog);
    renderComponent.scale.multiplyScalar(0.01);

    const radius = 0.049; // model is roughly 0.098 cubed
    const physicsBody = new CANNON.Body({
      mass: 0.1,
      shape: new CANNON.Sphere(radius),
      linearDamping: 0.75,
      angularDamping: 0.75,
    });

    super(physicsBody, renderComponent);
  }

  stopPhysics() {}

  restartPhysics() {}
}
