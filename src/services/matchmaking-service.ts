import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse } from "./interfaces/response/find-matches-response.js";

export class MatchmakingService {
  private apiService: ApiService;

  constructor(private readonly gameController: GameController) {
    this.apiService = gameController.getApiService();
  }

  public async findOrAdvertiseMatch(): Promise<void> {
    const matches = await this.findMatches();

    if (matches.length === 0) {
      console.log("No matches found");
      return this.advertiseMatch();
    }

    matches.forEach((match) => this.joinMatch(match));

    setTimeout(() => this.advertiseMatch(), 10_000);
  }

  private async findMatches(): Promise<FindMatchesResponse[]> {
    console.log("Finding matches...");

    const body: FindMatchesRequest = {
      version: "1.0.0",
      total_slots: 1,
      attributes: {
        mode: "battle",
      },
    };

    return this.apiService.findMatches(body);
  }

  private async advertiseMatch(): Promise<void> {
    console.log("Advertising match...");

    const body: AdvertiseMatchRequest = {
      version: "1.0.0",
      total_slots: 4,
      available_slots: 3,
      attributes: {
        mode: "battle",
      },
    };

    await this.apiService.advertiseMatch(body);
  }

  private joinMatch(match: FindMatchesResponse): void {
    const { token } = match;

    // Decode the base64 token to a byte array
    const decodedToken = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));

    // Send the decoded token as the payload
    this.gameController.getWebSocketService().sendTunnelMessage(decodedToken);
  }
}
