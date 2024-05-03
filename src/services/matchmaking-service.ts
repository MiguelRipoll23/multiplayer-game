import {
  API_HOSTNAME,
  API_HTTP_PROTOCOL,
  MESSAGE_ENDPOINT,
} from "../constants/api.js";
import { MessageResponse } from "./interfaces/message-response.js";

export class MatchmakingService {
  public async getServerMessage(): Promise<string> {
    const response = await this.getServerMessageResponse();
    return response.content;
  }

  private async getServerMessageResponse(): Promise<MessageResponse> {
    return fetch(API_HTTP_PROTOCOL + API_HOSTNAME + MESSAGE_ENDPOINT).then(
      (response) => response.json(),
    );
  }
}
