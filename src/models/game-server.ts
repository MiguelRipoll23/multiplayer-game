import { GameRegistration } from "./game-registration.js";

export class GameServer {
  private gameRegistration: GameRegistration | null = null;
  private connected: boolean = false;

  getGameRegistration(): GameRegistration | null {
    return this.gameRegistration;
  }

  setGameRegistration(gameRegistration: GameRegistration): void {
    this.gameRegistration = gameRegistration;
  }

  isConnected(): boolean {
    return this.connected;
  }

  setConnected(connected: boolean): void {
    this.connected = connected;
  }
}
