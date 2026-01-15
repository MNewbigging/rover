import { Dog } from "../dog";

export enum DogBehaviourName {
  WaitSit,
  WaitStand,
  Pickup,
  MoveToPlayer,
  DropSit,
  MoveToBall,
}

export abstract class DogBehaviour {
  subBehaviours: DogBehaviourName[] = [];

  constructor(protected dog: Dog) {}

  // Optional
  async onStart() {}

  abstract canFinish(): boolean;
  update(dt: number) {}
}
