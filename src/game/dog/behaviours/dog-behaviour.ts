import { NewDog } from "../new-dog";

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

  constructor(protected dog: NewDog) {}

  // Optional
  async onStart() {}

  abstract canFinish(): boolean;
  update(dt: number) {}
}
