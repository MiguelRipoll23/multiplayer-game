import {
  API_HTTP_PROTOCOL,
  API_SERVER,
  REGISTER_ENDPOINT,
} from "../constants/api.js";
import { GameRegistration } from "../models/game-registration.js";
import { GameServer } from "../models/game-server.js";
import { RegistrationResponse } from "./interfaces/registration-response.js";

export class RegistrationService {
  private gameServer: GameServer;

  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }

  public async registerUser(): Promise<void> {
    const name = prompt("Enter your player handle:");

    if (name === null) {
      return this.registerUser();
    }

    let registrationResponse: RegistrationResponse;

    try {
      registrationResponse = await this.getResponse(name);
    } catch (error) {
      console.error(error);
      alert("An error occurred while registering to the server");
      return;
    }

    console.log("Registration response", registrationResponse);

    const gameRegistration = new GameRegistration(registrationResponse);
    this.gameServer.setGameRegistration(gameRegistration);
  }

  private async getResponse(name: string): Promise<RegistrationResponse> {
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
}
