import { DogBehaviour } from "../behaviours/dog-behaviour";
import { NewDog } from "../new-dog";

export abstract class DogGoal {
  abstract behaviours: DogBehaviour[];
  currentBehaviour?: DogBehaviour;

  constructor(public dog: NewDog) {}

  abstract setupBehaviours(): void;

  abstract update(dt: number): void;
}
