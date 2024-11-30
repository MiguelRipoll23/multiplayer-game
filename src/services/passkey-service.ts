import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";

export class PasskeyService {
  private apiService: ApiService;

  constructor(gameController: GameController) {
    this.apiService = new ApiService(gameController);
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
          const authOptions = await this.apiService.getAuthenticationOptions(
            null
          );
          // This call to `navigator.credentials.get()` is "set and forget."
          // The Promise will only resolve if the user successfully interacts
          // with the browser's autofill UI to select a passkey.
          const webAuthnResponse = await navigator.credentials.get({
            mediation: "conditional",
            publicKey: {
              ...authOptions,
              challenge: Uint8Array.from(authOptions.challenge, (c) =>
                c.charCodeAt(0)
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
          await this.apiService.verifyAuthenticationResponse(webAuthnResponse);
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
    const authOptions = await this.apiService.getRegistrationOptions(name);

    const challengeBase64Decoded = atob(authOptions.challenge);
    const challenge = new Uint8Array(challengeBase64Decoded.length);

    for (let i = 0; i < challengeBase64Decoded.length; i++) {
      challenge[i] = challengeBase64Decoded.charCodeAt(i);
    }

    const publicKey = {
      ...authOptions,
      challenge,
      user: {
        id: new Uint8Array(16),
        name,
        displayName,
      },
      pubKeyCredParams: authOptions.pubKeyCredParams.map((pkcp) => ({
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
      await this.apiService.getAuthenticationOptions(null);

    const publicKey = {
      ...authenticationOptions,
      challenge: Uint8Array.from(authenticationOptions.challenge, (c) =>
        c.charCodeAt(0)
      ),
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
      await this.apiService.verifyAuthenticationResponse(credential);
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
  }
}
