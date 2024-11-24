import { GameServer } from "../models/game-server.js";

export class CryptoService {
  private gameServer: GameServer;

  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }

  public async decryptResponse(response: ArrayBuffer): Promise<string> {
    const gameRegistration = this.gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const sessionKey = gameRegistration.getSessionKey();

    const iv = response.slice(0, 12);
    const data = response.slice(12);

    const keyData =
      Uint8Array.from(atob(sessionKey), (c) => c.charCodeAt(0)).buffer;

    const algorithm = {
      name: "AES-GCM",
      iv,
    };

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      algorithm,
      cryptoKey,
      data,
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  public async encryptRequest(request: string): Promise<ArrayBuffer> {
    const gameRegistration = this.gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const sessionKey = gameRegistration.getSessionKey();

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(request);

    const keyData =
      Uint8Array.from(atob(sessionKey), (c) => c.charCodeAt(0)).buffer;

    const algorithm = {
      name: "AES-GCM",
      iv,
    };

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
      algorithm,
      cryptoKey,
      data,
    );

    const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combinedBuffer.set(iv, 0);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

    return combinedBuffer.buffer;
  }
}
