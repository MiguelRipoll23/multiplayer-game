import { API_BASE_URL, CONFIGURATION_ENDPOINT, MATCHES_ADVERTISE_ENDPOINT, MATCHES_FIND_ENDPOINT, MESSAGES_ENDPOINT, REGISTER_ENDPOINT, VERSION_ENDPOINT, } from "../constants/api-constants.js";
export class ApiService {
    authenticationToken = null;
    async checkForUpdates() {
        const response = await fetch(API_BASE_URL + VERSION_ENDPOINT);
        if (response.ok === false) {
            throw new Error("Failed to fetch version");
        }
        const versionResponse = await response.json();
        console.log("Version response", versionResponse);
        return false;
    }
    async registerUser(name) {
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
        const registrationResponse = await response.json();
        console.log("Registration response", registrationResponse);
        this.authenticationToken = registrationResponse.authentication_token;
        return registrationResponse;
    }
    async getConfiguration() {
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
    async getMessages() {
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
        const messagesResponse = await response.json();
        console.log("Messages response", messagesResponse);
        return messagesResponse;
    }
    async findMatches(findMatchesRequest) {
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
        const findMatchResponse = await response.json();
        console.log("Find matches response", findMatchResponse);
        return findMatchResponse;
    }
    async advertiseMatch(advertiseMatchRequest) {
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
}
