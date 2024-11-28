/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { ServerRegistration } from "./server-registration.js";

export class GameServer {
  private serverRegistration: ServerRegistration | null = null;
  private configuration: Object | null = null;

  private connected: boolean = false;

  getServerRegistration(): ServerRegistration | null {
    return this.serverRegistration;
  }

  setServerRegistration(serverRegistration: ServerRegistration): void {
    this.serverRegistration = serverRegistration;
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
