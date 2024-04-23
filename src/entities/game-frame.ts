import { GameObjects } from "../interfaces/game-objects.js";

export class GameFrame {
  public objects: GameObjects;

  constructor() {
    this.objects = {
      scene: [],
      ui: [],
    };
  }
}
