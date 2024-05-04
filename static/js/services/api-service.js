import { API_HOSTNAME, API_HTTP_PROTOCOL, API_SERVER, CONFIGURATION_ENDPOINT, MESSAGE_ENDPOINT, REGISTER_ENDPOINT, VERSION_ENDPOINT, } from "../constants/api.js";
export class ApiService {
    gameServer;
    constructor(gameServer) {
        this.gameServer = gameServer;
    }
    async checkForUpdates() {
        const response = await fetch(API_HTTP_PROTOCOL + API_SERVER + VERSION_ENDPOINT).then((response) => response.json());
        return false;
    }
    async getServerMessage() {
        const response = await fetch(API_HTTP_PROTOCOL + API_HOSTNAME + MESSAGE_ENDPOINT).then((response) => response.json());
        return response.content;
    }
    async registerUser(name) {
        const registrationResponse = await fetch(API_HTTP_PROTOCOL + API_SERVER + REGISTER_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
            }),
        });
        return registrationResponse.json();
    }
    async getConfiguration() {
        const gameRegistration = this.gameServer.getGameRegistration();
        if (gameRegistration === null) {
            throw new Error("Game registration not found");
        }
        const authenticationToken = gameRegistration.getAuthenticationToken();
        if (authenticationToken === null) {
            throw new Error("Authentication token not found");
        }
        const response = await fetch(API_HTTP_PROTOCOL + API_HOSTNAME + CONFIGURATION_ENDPOINT, {
            headers: {
                "Authorization": authenticationToken,
            },
        });
        return response.arrayBuffer();
    }
}
