import { API_HOSTNAME, API_HTTP_PROTOCOL, MESSAGE_ENDPOINT, } from "../constants/api.js";
export class MatchmakingService {
    async getServerMessage() {
        const response = await this.getServerMessageResponse();
        return response.content;
    }
    async getServerMessageResponse() {
        return fetch(API_HTTP_PROTOCOL + API_HOSTNAME + MESSAGE_ENDPOINT).then((response) => response.json());
    }
}
