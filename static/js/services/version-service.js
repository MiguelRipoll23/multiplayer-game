import { API_HTTP_PROTOCOL, API_SERVER, VERSION_ENDPOINT, } from "../constants/api.js";
export class VersionService {
    async checkForUpdates() {
        const response = await this.getVersionResponse();
        console.log("Version response", response);
        return false;
    }
    applyUpdate() {
        alert("An update is available. The application will now reload to apply the update.");
    }
    async getVersionResponse() {
        return fetch(API_HTTP_PROTOCOL + API_SERVER + VERSION_ENDPOINT).then((response) => response.json());
    }
}
