import { EventType } from "../enums/event-type.js";
import { AuthenticationResponse } from "../interfaces/response/authentication_response.js";
import { GameController } from "../models/game-controller.js";
import { GameState } from "../models/game-state.js";
import { LocalEvent } from "../models/local-event.js";
import { ServerRegistration } from "../models/server-registration.js";
import { ApiService } from "./api-service.js";
import { EventProcessorService } from "./event-processor-service.js";

export class PasskeyService {
  private gameState: GameState;
  private apiService: ApiService;
  private eventProcessorService: EventProcessorService;

  private requestId: string;

  constructor(gameController: GameController) {
    this.gameState = gameController.getGameState();
    this.apiService = gameController.getApiService();
    this.eventProcessorService = gameController.getEventProcessorService();
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
            mediation: "optional",
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
          const response = await this.apiService.verifyAuthenticationResponse(
            this.requestId,
            webAuthnResponse
          );

          this.handleAuthenticationResponse(response);
        } catch (error) {
          console.error("Error with conditional UI:", error);
        }
      }
    }
  }

  public async registerPasskey(
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

    const credential = await navigator.credentials.create({
      publicKey,
    });

    if (credential === null) {
      throw new Error("User canceled credential creation");
    }

    const response = await this.apiService.verifyRegistrationResponse(
      name,
      credential
    );

    this.handleAuthenticationResponse(response);
  }

  public async usePasskey(): Promise<void> {
    const authenticationOptions =
      await this.apiService.getAuthenticationOptions(this.requestId);

    const publicKey = {
      ...authenticationOptions,
      challenge: this.challengeToUint8Array(authenticationOptions.challenge),
    };

    const credential = await navigator.credentials.get({
      publicKey,
    });

    if (credential === null) {
      throw new Error("User canceled credential request");
    }

    const response = await this.apiService.verifyAuthenticationResponse(
      this.requestId,
      credential
    );

    this.handleAuthenticationResponse(response);
  }

  private challengeToUint8Array(challenge: string): Uint8Array {
    const base64 = challenge.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return Uint8Array.from(atob(paddedBase64), (c) => c.charCodeAt(0));
  }

  private handleAuthenticationResponse(response: AuthenticationResponse): void {
    this.apiService.setAuthenticationToken(response.authentication_token);
    this.gameState.getGamePlayer().setName(response.display_name);

    this.gameState
      .getGameServer()
      .setServerRegistration(new ServerRegistration(response));

    const localEvent = new LocalEvent(EventType.ServerAuthenticated, null);
    this.eventProcessorService.addLocalEvent(localEvent);
  }
}
