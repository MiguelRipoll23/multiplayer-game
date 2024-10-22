import {
  API_BASE_URL,
  CONFIGURATION_ENDPOINT,
  MESSAGES_ENDPOINT,
  REGISTER_ENDPOINT,
  VERSION_ENDPOINT,
} from "../constants/api-constants.js";
import { MessagesResponse } from "./interfaces/messages-response.js";
import { RegistrationResponse } from "./interfaces/registration-response.js";
import { VersionResponse } from "./interfaces/version-response.js";

export class ApiService {
  private authenticationToken: string | null = null;

  public async checkForUpdates(): Promise<boolean> {
    const response = await fetch(API_BASE_URL + VERSION_ENDPOINT);

    if (response.ok === false) {
      throw new Error("Failed to fetch version");
    }

    const versionResponse: VersionResponse = await response.json();
    console.log("Version response", versionResponse);

    return false;
  }

  public async registerUser(name: string): Promise<RegistrationResponse> {
    const response = await fetch(API_BASE_URL + REGISTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (response.ok === false) {
      throw new Error("Failed to register user");
    }

    const registrationResponse: RegistrationResponse = await response.json();
    console.log("Registration response", registrationResponse);

    this.authenticationToken = registrationResponse.authentication_token;

    return registrationResponse;
  }

  public async getConfiguration(): Promise<ArrayBuffer> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + CONFIGURATION_ENDPOINT, {
      headers: {
        "Authorization": this.authenticationToken,
      },
    });

    if (response.ok === false) {
      throw new Error("Failed to fetch configuration");
    }

    return response.arrayBuffer();
  }

  public async getMessages(): Promise<MessagesResponse[]> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + MESSAGES_ENDPOINT, {
      headers: {
        "Authorization": this.authenticationToken,
      },
    });

    if (response.ok === false) {
      throw new Error("Failed to fetch messages");
    }

    const messagesResponse: MessagesResponse[] = await response.json();
    console.log("Messages response", messagesResponse);

    return messagesResponse;
  }
}
