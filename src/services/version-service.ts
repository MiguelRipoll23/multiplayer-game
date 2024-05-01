import {
  API_HTTP_PROTOCOL,
  API_SERVER,
  VERSION_ENDPOINT,
} from "../constants/api.js";
import { VersionResponse } from "./interfaces/version-response.js";

export class VersionService {
  public async checkForUpdates(): Promise<boolean> {
    const response = await this.getVersionData();
    console.log("Version response", response);

    return false;
  }

  public applyUpdate(): void {
    alert(
      "An update is available. The application will now reload to apply the update.",
    );
  }

  private async getVersionData(): Promise<VersionResponse> {
    return fetch(API_HTTP_PROTOCOL + API_SERVER + VERSION_ENDPOINT).then(
      (response) => response.json(),
    );
  }
}
