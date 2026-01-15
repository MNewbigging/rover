import { DogBehaviour } from "../behaviours/dog-behaviour";
import { NewDog } from "../new-dog";

export type DogGoalName = "wait" | "follow" | "fetch" | "return";

export abstract class DogGoal {
  abstract name: DogGoalName;
  abstract behaviours: DogBehaviour[];
  abstract currentBehaviour?: DogBehaviour;

  constructor(public dog: NewDog) {}

  // It's up to each goal to queue the correct behaviours at the start
  abstract setupBehaviours(): void;

  // Each goal determines when it should finish and returns the name of the next goal to perform
  // Note: this could also be handled by the dog class but there'd be dupe logic
  abstract getNextGoalName(): DogGoalName | undefined;

  // Just because a goal should finish doesn't mean it can; might need to wait for anims to finish
  canFinish(): boolean {
    // Default waits for all behaviours to finish; interruptable goals need implementing
    return this.areBehavioursFinished();
  }

  update(dt: number) {
    this.performBehaviours(dt);
  }

  protected areBehavioursFinished() {
    // Once current and all queued behaviours are done
    return this.behaviours.length === 0 && this.currentBehaviour === undefined;
  }

  private performBehaviours(dt: number) {
    // Sets the first behaviour
    if (!this.currentBehaviour && this.behaviours.length) {
      this.currentBehaviour = this.behaviours.shift();
      this.currentBehaviour?.onStart();
    }

    // If the current behaviour is done, set the next one (if any)
    if (this.currentBehaviour?.canFinish()) {
      this.currentBehaviour = this.behaviours.shift();
      this.currentBehaviour?.onStart();
    }

    // Update any current behaviour
    this.currentBehaviour?.update(dt);
  }
}
