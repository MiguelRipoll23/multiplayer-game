import { API_HTTP_PROTOCOL, API_SERVER, REGISTER_ENDPOINT, } from "../constants/api.js";
import { GameRegistration } from "../models/game-registration.js";
export class RegistrationService {
    gameServer;
    constructor(gameServer) {
        this.gameServer = gameServer;
    }
    async registerUser() {
        const name = prompt("Enter your player handle:");
        if (name === null) {
            return this.registerUser();
        }
        let registrationResponse;
        try {
            registrationResponse = await this.getResponse(name);
        }
        catch (error) {
            console.error(error);
            alert("An error occurred while registering to the server");
            return;
        }
        console.log("Registration response", registrationResponse);
        const gameRegistration = new GameRegistration(registrationResponse);
        this.gameServer.setGameRegistration(gameRegistration);
    }
    async getResponse(name) {
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
}
