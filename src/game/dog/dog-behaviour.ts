import { NewDog } from "./new-dog";

export enum DogBehaviourName {
  Waiting, // Can move into following or fetching from here
  FollowWithoutBall, // Can move into fetching
  FollowWithBall,
  Fetching, // Can move into returning
  Returning, // Can move into waiting
}

export abstract class DogBehaviour {
  abstract name: DogBehaviourName;

  constructor(protected dog: NewDog) {}

  // Optional
  onStart() {}
  onFinish() {}

  abstract shouldFinish(): boolean;
  abstract canFinish(): boolean; // ready to move to new behaviour?
  abstract getNextBehaviourName(): DogBehaviourName;
  abstract update(dt: number): void;
}
