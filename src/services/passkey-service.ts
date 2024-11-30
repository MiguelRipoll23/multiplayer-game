import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";

export class PasskeyService {
  private apiService: ApiService;
  private requestId: string;

  constructor(gameController: GameController) {
    this.apiService = new ApiService(gameController);
    this.requestId = crypto.randomUUID();
  }

  public async showAutofillUI(): Promise<void> {
    if (
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof window.PublicKeyCredential.isConditionalMediationAvailable ===
        "function"
    ) {
      const available =
        await PublicKeyCredential.isConditionalMediationAvailable();

      if (available) {
        try {
          // Retrieve authentication options for `navigator.credentials.get()`
          // from your server.
          const authenticationOptions =
            await this.apiService.getAuthenticationOptions(this.requestId);
          // This call to `navigator.credentials.get()` is "set and forget."
          // The Promise will only resolve if the user successfully interacts
          // with the browser's autofill UI to select a passkey.
          const webAuthnResponse = await navigator.credentials.get({
            mediation: "conditional",
            publicKey: {
              ...authenticationOptions,
              challenge: this.challengeToUint8Array(
                authenticationOptions.challenge
              ),
              userVerification: "preferred",
            },
          });

          if (webAuthnResponse === null) {
            // The user closed the autofill UI without selecting a passkey.
            console.log("User closed the autofill UI");
            return;
          }

          // Send the response to your server for verification and
          // authenticate the user if the response is valid.
          await this.apiService.verifyAuthenticationResponse(
            this.requestId,
            webAuthnResponse
          );
        } catch (error) {
          console.error("Error with conditional UI:", error);
        }
      }
    }
  }

  public async createCredential(
    name: string,
    displayName: string
  ): Promise<void> {
    console.log("Creating credential for", name);
    const registrationOptions = await this.apiService.getRegistrationOptions(
      name
    );

    const publicKey = {
      ...registrationOptions,
      challenge: this.challengeToUint8Array(registrationOptions.challenge),
      user: {
        id: new Uint8Array(16),
        name,
        displayName,
      },
      pubKeyCredParams: registrationOptions.pubKeyCredParams.map((pkcp) => ({
        type: pkcp.type,
        alg: pkcp.alg,
      })),
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey,
      });

      if (credential === null) {
        console.log("User canceled credential creation");
        return;
      }

      // Send the response to your server for verification and
      // authenticate the user if the response is valid.
      await this.apiService.verifyRegistrationResponse(name, credential);
    } catch (error) {
      console.error("Error creating credential:", error);
    }
  }

  public async authenticateUser(): Promise<void> {
    const authenticationOptions =
      await this.apiService.getAuthenticationOptions(this.requestId);

    const publicKey = {
      ...authenticationOptions,
      challenge: this.challengeToUint8Array(authenticationOptions.challenge),
    };

    try {
      const credential = await navigator.credentials.get({
        publicKey,
      });

      if (credential === null) {
        console.log("User canceled authentication");
        return;
      }

      // Send the response to your server for verification and
      // authenticate the user if the response is valid.
      await this.apiService.verifyAuthenticationResponse(
        this.requestId,
        credential
      );
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
  }

  private challengeToUint8Array(challenge: string): Uint8Array {
    const base64 = challenge.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return Uint8Array.from(atob(paddedBase64), (c) => c.charCodeAt(0));
  }
}
