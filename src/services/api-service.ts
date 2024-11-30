import {
  API_BASE_URL,
  CONFIGURATION_ENDPOINT,
  MATCHES_ADVERTISE_ENDPOINT,
  MATCHES_FIND_ENDPOINT,
  MATCHES_REMOVE_ENDPOINT,
  MESSAGES_ENDPOINT,
  REGISTER_ENDPOINT,
  VERSION_ENDPOINT,
  SCOREBOARD_SAVE_SCORE_PATH,
  SCOREBOARD_GET_RANKING_PATH,
  REGISTRATION_OPTIONS_ENDPOINT,
  VERIFY_REGISTRATION_RESPONSE_ENDPOINT,
  VERIFY_AUTHENTICATION_RESPONSE_ENDPOINT,
  AUTHENTICATION_OPTIONS_ENDPOINT,
} from "../constants/api-constants.js";
import { FindMatchesResponse as FindMatchesResponse } from "../interfaces/response/find-matches-response.js";
import { MessagesResponse } from "../interfaces/response/messages-response.js";
import { RegistrationResponse } from "../interfaces/response/registration-response.js";
import { VersionResponse } from "../interfaces/response/version-response.js";
import { RankingResponse } from "../interfaces/response/ranking-response.js";
import { CryptoService } from "./crypto-service.js";
import { GameController } from "../models/game-controller.js";
import { AdvertiseMatchRequest } from "../interfaces/request/advertise-match-request.js";
import { FindMatchesRequest } from "../interfaces/request/find-matches-request.js";
import { SaveScoreRequest } from "../interfaces/request/save-score-request.js";
import { AuthenticationOptionsResponse } from "../interfaces/response/authentication-options-response.js";

export class ApiService {
  private authenticationToken: string | null = null;
  private cryptoService: CryptoService;

  constructor(gameController: GameController) {
    this.cryptoService = gameController.getCryptoService();
  }

  public async checkForUpdates(): Promise<boolean> {
    const response = await fetch(API_BASE_URL + VERSION_ENDPOINT);

    if (response.ok === false) {
      throw new Error("Failed to fetch version");
    }

    const versionResponse: VersionResponse = await response.json();
    console.log("Version response", versionResponse);

    return false;
  }

  public async getRegistrationOptions(
    username: string
  ): Promise<AuthenticationOptionsResponse> {
    const response = await fetch(API_BASE_URL + REGISTRATION_OPTIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    if (response.ok === false) {
      throw new Error("Failed to fetch auth options");
    }

    const registrationOptions = await response.json();
    console.log("Registration options", registrationOptions);

    return registrationOptions;
  }

  public async verifyRegistrationResponse(
    username: string,
    credential: Credential
  ): Promise<void> {
    const response = await fetch(
      API_BASE_URL + VERIFY_REGISTRATION_RESPONSE_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          registrationResponse: credential,
        }),
      }
    );

    if (response.ok === false) {
      throw new Error("Failed to verify registration response");
    }

    const registrationResponse = await response.json();
    console.log("Registration response", registrationResponse);
  }

  public async getAuthenticationOptions(
    username: string | null
  ): Promise<AuthenticationOptionsResponse> {
    const response = await fetch(
      API_BASE_URL + AUTHENTICATION_OPTIONS_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      }
    );

    if (response.ok === false) {
      throw new Error("Failed to fetch authentication options");
    }

    const authenticationOptions = await response.json();
    console.log("Authentication options", authenticationOptions);

    return authenticationOptions;
  }

  public async verifyAuthenticationResponse(
    credential: Credential
  ): Promise<void> {
    const response = await fetch(
      API_BASE_URL + VERIFY_AUTHENTICATION_RESPONSE_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credential),
      }
    );

    if (response.ok === false) {
      throw new Error("Failed to verify authentication response");
    }

    const authenticationResponse = await response.json();
    console.log("Authentication response", authenticationResponse);
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

  public async saveScore(saveScoreRequest: SaveScoreRequest): Promise<void> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const encryptedRequest = await this.cryptoService.encryptRequest(
      JSON.stringify(saveScoreRequest)
    );

    const response = await fetch(API_BASE_URL + SCOREBOARD_SAVE_SCORE_PATH, {
      method: "POST",
      headers: {
        Authorization: this.authenticationToken,
        "Content-Type": "application/json",
      },
      body: encryptedRequest,
    });

    if (response.ok === false) {
      throw new Error("Failed to save score");
    }

    if (response.status !== 204) {
      throw new Error("Failed to save score");
    }

    console.log("Score saved");
  }

  public async getRanking(): Promise<RankingResponse[]> {
    if (this.authenticationToken === null) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(API_BASE_URL + SCOREBOARD_GET_RANKING_PATH, {
      headers: {
        Authorization: this.authenticationToken,
      },
    });

    if (response.ok === false) {
      throw new Error("Failed to fetch ranking");
    }

    const rankingResponse: RankingResponse[] = await response.json();
    console.log("Ranking response", rankingResponse);

    return rankingResponse;
  }
}
