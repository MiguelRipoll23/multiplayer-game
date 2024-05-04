import {
  API_HOSTNAME,
  API_HTTP_PROTOCOL,
  API_SERVER,
  CONFIGURATION_ENDPOINT,
  MESSAGE_ENDPOINT,
  REGISTER_ENDPOINT,
  VERSION_ENDPOINT,
} from "../constants/api.js";
import { GameServer } from "../models/game-server.js";
import { MessageResponse } from "./interfaces/message-response.js";
import { RegistrationResponse } from "./interfaces/registration-response.js";
import { VersionResponse } from "./interfaces/version-response.js";

export class ApiService {
  private gameServer: GameServer;

  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }

  public async checkForUpdates(): Promise<boolean> {
    const response: VersionResponse = await fetch(
      API_HTTP_PROTOCOL + API_SERVER + VERSION_ENDPOINT,
    ).then(
      (response) => response.json(),
    );

    return false;
  }

  public async getServerMessage(): Promise<string> {
    const response: MessageResponse = await fetch(
      API_HTTP_PROTOCOL + API_HOSTNAME + MESSAGE_ENDPOINT,
    ).then(
      (response) => response.json(),
    );

    return response.content;
  }

  public async registerUser(name: string): Promise<RegistrationResponse> {
    const registrationResponse = await fetch(
      API_HTTP_PROTOCOL + API_SERVER + REGISTER_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

    return registrationResponse.json();
  }

  public async getConfiguration(): Promise<ArrayBuffer> {
    const gameRegistration = this.gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const authenticationToken = gameRegistration.getAuthenticationToken();

    if (authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      API_HTTP_PROTOCOL + API_HOSTNAME + CONFIGURATION_ENDPOINT,
      {
        headers: {
          "Authorization": authenticationToken,
        },
      },
    );

    return response.arrayBuffer();
  }
}
