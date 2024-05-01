import { API_SERVER, VERSION_ENDPOINT } from "../constants/api.js";
export class UpdateService {
    async checkForUpdates() {
        const response = await this.getVersionData();
        console.log("Version response", response);
        return false;
    }
    applyUpdate() {
        alert("An update is available. The application will now reload to apply the update.");
    }
    async getVersionData() {
        return fetch(API_SERVER + VERSION_ENDPOINT).then((response) => response.json());
    }
}
