import { DogBehaviour } from "../behaviours/dog-behaviour";
import { NewDog } from "../new-dog";

// A goal is just a container for behaviours
// Each goal constructs a list of sub-behaviours to follow through with
// The sub-behaviours may be different for the same goal at different times:

/**
 * GOALS and BEHAVIOURS
 *
 * Goal: Wait (while near player)
 * - B: Sit and perform random 1-shots
 * OR
 * - B: Stand and perform random 1-shots (after player picks up ball)
 * BUT
 *  - might change whilst waiting
 *
 * Goal: Follow (once player is far enough away)
 * - B: Pickup Ball (from sit) (if ball neaby)
 * - B: Follow player
 * - B: Drop Ball & Sit
 *  OR
 * - B: Follow player (depends if player has ball)
 *
 * Goal: Fetch
 * - B: Run to ball
 * - B: Pickup ball (from stand) (once ball nearby)
 *
 * Goal: Return
 * - B: Follow player
 * - B: Drop Ball & Sit
 */

export abstract class DogGoal {
  abstract behaviours: DogBehaviour[];

  constructor(public dog: NewDog) {}

  abstract setupBehaviours(): void;

  abstract update(dt: number): void;
}
