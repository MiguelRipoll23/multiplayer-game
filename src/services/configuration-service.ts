import {
  API_HOSTNAME,
  API_HTTP_PROTOCOL,
  CONFIGURATION_ENDPOINT,
} from "../constants/api.js";
import { GameServer } from "../models/game-server.js";

export class ConfigurationService {
  private gameServer: GameServer;

  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }

  public async downloadFromServer(): Promise<void> {
    const response = await this.getResponse();
    const decryptedResponse = await this.decryptResponse(response);
    const configuration = JSON.parse(decryptedResponse);

    console.log("Configuration response", configuration);
  }

  private async getResponse(): Promise<ArrayBuffer> {
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

  private async decryptResponse(response: ArrayBuffer): Promise<string> {
    const gameRegistration = this.gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const sessionKey = gameRegistration.getSessionKey();

    const iv = response.slice(0, 12);
    const data = response.slice(12);

    const keyData =
      Uint8Array.from(atob(sessionKey), (c) => c.charCodeAt(0)).buffer;

    const algorithm = {
      name: "AES-GCM",
      iv,
    };

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      algorithm,
      cryptoKey,
      data,
    );

    return new TextDecoder().decode(decryptedBuffer);
  }
}
