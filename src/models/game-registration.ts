import { RegistrationResponse } from "../services/interfaces/response/registration-response.js";

export class GameRegistration {
  private authenticationToken: string;
  private sessionKey: string;
  private userId: string;
  private publicIp: string;

  constructor(registrationResponse: RegistrationResponse) {
    this.authenticationToken = registrationResponse.authentication_token;
    this.sessionKey = registrationResponse.session_key;
    this.userId = registrationResponse.user_id;
    this.publicIp = registrationResponse.public_ip;
  }

  public getAuthenticationToken(): string {
    return this.authenticationToken;
  }

  public getSessionKey(): string {
    return this.sessionKey;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPublicIp(): string {
    return this.publicIp;
  }
}
