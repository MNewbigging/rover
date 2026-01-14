import { NewDog } from "./new-dog";

export enum DogBehaviourName {
  Waiting, // Can move into following or fetching from here
  FollowWithoutBall, // Can move into fetching
  FollowWithBall,
  Fetching, // Can move into returning
  Returning, // Can move into waiting
  PickupBall,
  FollowPlayer,
}

export abstract class DogBehaviour {
  abstract name: DogBehaviourName;

  subBehaviours: DogBehaviourName[] = [];

  constructor(protected dog: NewDog) {}

  // Optional
  async onStart() {}
  onFinish() {}

  abstract canFinish(): boolean;
  abstract getNextBehaviourName(): DogBehaviourName;
  abstract update(dt: number): void;
}
