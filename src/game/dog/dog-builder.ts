import * as THREE from "three";
import { AssetManager, ModelAsset } from "../asset-manager";

export function buildDog(name: string, assetManager: AssetManager) {
  const dogs = assetManager.getModel(ModelAsset.DOGS);
  dogs.scale.multiplyScalar(0.01);
  showDog(dogs, name);
  hideDogExtras(dogs);
  return dogs;
}

function showDog(topdog: THREE.Object3D, name: string) {
  // The top-level object is a group with two children; a Group named 'mesh', and a Bone
  const meshGroup = topdog.children[0];

  // The mesh group has 18 children, all groups with Dogs being the first and attachments/other stuff in the rest
  const dogsGroup = meshGroup.children[0];

  // The dogs group has 28 skinned mesh children, each represents a dog
  dogsGroup.children.forEach((child) => (child.visible = false));
  const dog = dogsGroup.getObjectByName(name);
  if (dog) dog.visible = true;
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
