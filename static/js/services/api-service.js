import { API_HTTP_PROTOCOL, API_SERVER, CONFIGURATION_ENDPOINT, MESSAGE_ENDPOINT, REGISTER_ENDPOINT, VERSION_ENDPOINT, } from "../constants/api-constants.js";
export class ApiService {
    authenticationToken = null;
    async checkForUpdates() {
        const response = await fetch(API_HTTP_PROTOCOL + API_SERVER + VERSION_ENDPOINT);
        if (response.ok === false) {
            throw new Error("Failed to fetch version");
        }
        const versionResponse = await response.json();
        console.log("Version response", versionResponse);
        return false;
    }
    async registerUser(name) {
        const response = await fetch(API_HTTP_PROTOCOL + API_SERVER + REGISTER_ENDPOINT, {
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
        const registrationResponse = await response.json();
        console.log("Registration response", registrationResponse);
        this.authenticationToken = registrationResponse.authentication_token;
        return registrationResponse;
    }
    async getConfiguration() {
        if (this.authenticationToken === null) {
            throw new Error("Authentication token not found");
        }
        const response = await fetch(API_HTTP_PROTOCOL + API_SERVER + CONFIGURATION_ENDPOINT, {
            headers: {
                "Authorization": this.authenticationToken,
            },
        });
        if (response.ok === false) {
            throw new Error("Failed to fetch configuration");
        }
        return response.arrayBuffer();
    }
    async getMessage() {
        if (this.authenticationToken === null) {
            throw new Error("Authentication token not found");
        }
        const response = await fetch(API_HTTP_PROTOCOL + API_SERVER + MESSAGE_ENDPOINT, {
            headers: {
                "Authorization": this.authenticationToken,
            },
        });
        if (response.ok === false) {
            throw new Error("Failed to fetch message");
        }
        const messageResponse = await response.json();
        console.log("Message response", messageResponse);
        return messageResponse;
    }
}
