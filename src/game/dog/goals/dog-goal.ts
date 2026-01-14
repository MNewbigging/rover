import { DogBehaviour } from "../behaviours/dog-behaviour";
import { NewDog } from "../new-dog";

export type DogGoalName = "wait" | "follow" | "fetch" | "return";

export abstract class DogGoal {
  abstract name: DogGoalName;
  abstract behaviours: DogBehaviour[];
  abstract currentBehaviour?: DogBehaviour;

  constructor(public dog: NewDog) {}

  abstract setupBehaviours(): void;

  // todo should probably have a default implementation of moving through behaviours here
  abstract update(dt: number): void;

  abstract canFinish(): boolean;
}
