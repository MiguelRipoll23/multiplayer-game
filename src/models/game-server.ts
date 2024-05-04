import { GameRegistration } from "./game-registration.js";

export class GameServer {
  private gameRegistration: GameRegistration | null = null;
  private configuration: Object | null = null;

  private connected: boolean = false;

  getGameRegistration(): GameRegistration | null {
    return this.gameRegistration;
  }

  setGameRegistration(gameRegistration: GameRegistration): void {
    this.gameRegistration = gameRegistration;
  }

  getConfiguration(): Object | null {
    return this.configuration;
  }

  setConfiguration(configuration: Object): void {
    this.configuration = configuration;
  }

  isConnected(): boolean {
    return this.connected;
  }

  setConnected(connected: boolean): void {
    this.connected = connected;
  }
}
