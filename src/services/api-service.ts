import {
  API_BASE_URL,
  CONFIGURATION_ENDPOINT,
  MATCHES_ADVERTISE_ENDPOINT,
  MATCHES_FIND_ENDPOINT,
  MATCHES_REMOVE_ENDPOINT,
  MESSAGES_ENDPOINT,
  REGISTER_ENDPOINT,
  VERSION_ENDPOINT,
} from "../constants/api-constants.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse as FindMatchesResponse } from "./interfaces/response/find-matches-response.js";
import { MessagesResponse } from "./interfaces/response/messages-response.js";
import { RegistrationResponse } from "./interfaces/response/registration-response.js";
import { VersionResponse } from "./interfaces/response/version-response.js";

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
        Authorization: this.authenticationToken,
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
        Authorization: this.authenticationToken,
      },
    });

    if (response.ok === false) {
      throw new Error("Failed to fetch messages");
    }

    const messagesResponse: MessagesResponse[] = await response.json();
    console.log("Messages response", messagesResponse);

    return messagesResponse;
  }

  public async findMatches(
    findMatchesRequest: FindMatchesRequest
  ): Promise<FindMatchesResponse[]> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + MATCHES_FIND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: this.authenticationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(findMatchesRequest),
    });

    if (response.ok === false) {
      throw new Error("Failed to find matches");
    }

    const findMatchResponse: FindMatchesResponse[] = await response.json();
    console.log("Find matches response", findMatchResponse);

    return findMatchResponse;
  }

  public async advertiseMatch(
    advertiseMatchRequest: AdvertiseMatchRequest
  ): Promise<void> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + MATCHES_ADVERTISE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: this.authenticationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(advertiseMatchRequest),
    });

    if (response.ok === false) {
      throw new Error("Failed to advertise match");
    }

    if (response.status !== 204) {
      throw new Error("Failed to advertise match");
    }

    console.log("Match advertised");
  }

  public async removeMatch(): Promise<void> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + MATCHES_REMOVE_ENDPOINT, {
      method: "DELETE",
      headers: {
        Authorization: this.authenticationToken,
      },
    });

    if (response.ok === false) {
      throw new Error("Failed to remove match");
    }

    if (response.status !== 204) {
      throw new Error("Failed to remove match");
    }

    console.log("Match removed");
  }
}
