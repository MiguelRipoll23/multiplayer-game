import { EventType } from "../enums/event-type.js";
import { AuthenticationResponse } from "../interfaces/response/authentication_response.js";
import { GameController } from "../models/game-controller.js";
import { GameState } from "../models/game-state.js";
import { LocalEvent } from "../models/local-event.js";
import { ServerRegistration } from "../models/server-registration.js";
import { ApiService } from "./api-service.js";
import { EventProcessorService } from "./event-processor-service.js";

export class CredentialService {
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
      typeof window.PublicKeyCredential === "undefined" ||
      typeof window.PublicKeyCredential.isConditionalMediationAvailable !==
        "function"
    ) {
      return;
    }

    const available =
      await PublicKeyCredential.isConditionalMediationAvailable();

    if (available) {
      const authenticationOptions =
        await this.apiService.getAuthenticationOptions(this.requestId);

      const webAuthnResponse = await navigator.credentials.get({
        mediation: "optional",
        publicKey: {
          challenge: this.challengeToUint8Array(
            authenticationOptions.challenge
          ),
        },
      });

      if (webAuthnResponse === null) {
        console.log("User closed the autofill UI");
        return;
      }

      const response = await this.apiService.verifyAuthenticationResponse(
        this.requestId,
        this.serializeCredential(webAuthnResponse)
      );

      this.handleAuthenticationResponse(response);
    }
  }

  public async registerCredential(
    name: string,
    displayName: string
  ): Promise<void> {
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

    alert(`Credential created: ${JSON.stringify(credential)}`); // Pa63e

    const response = await this.apiService.verifyRegistrationResponse(
      name,
      this.serializeCredential(credential)
    );

    this.handleAuthenticationResponse(response);
  }

  public async useCredential(): Promise<void> {
    const authenticationOptions =
      await this.apiService.getAuthenticationOptions(this.requestId);

    const publicKey = {
      challenge: this.challengeToUint8Array(authenticationOptions.challenge),
    };

    const credential = await navigator.credentials.get({
      publicKey,
    });

    if (credential === null) {
      throw new Error("User canceled credential request");
    }

    alert(`Credential used: ${JSON.stringify(credential)}`); // P7ed6

    const response = await this.apiService.verifyAuthenticationResponse(
      this.requestId,
      this.serializeCredential(credential)
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

  private base64UrlEncode(data: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(data)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""); // Remove padding
  }

  private serializeCredential(credential: PublicKeyCredential): SerializedCredential {
    const { id, type, rawId, response } = credential;

    return {
      id: this.base64UrlEncode(new TextEncoder().encode(id)), // Base64 URL encode the `id`
      type,
      rawId: this.base64UrlEncode(rawId),
      response: {
        clientDataJSON: this.base64UrlEncode(response.clientDataJSON),
        attestationObject: (response as AuthenticatorAttestationResponse).attestationObject
          ? this.base64UrlEncode((response as AuthenticatorAttestationResponse).attestationObject!)
          : null,
        authenticatorData: (response as AuthenticatorAssertionResponse).authenticatorData
          ? this.base64UrlEncode((response as AuthenticatorAssertionResponse).authenticatorData!)
          : null,
        signature: (response as AuthenticatorAssertionResponse).signature
          ? this.base64UrlEncode((response as AuthenticatorAssertionResponse).signature!)
          : null,
        userHandle: (response as AuthenticatorAssertionResponse).userHandle
          ? this.base64UrlEncode((response as AuthenticatorAssertionResponse).userHandle!)
          : null,
      },
    };
  }
}
