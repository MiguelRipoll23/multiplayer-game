import { WebRTCUserService } from "./webrtc-user-service.js";

export class WebRTCService {
  private users: Map<string, WebRTCUserService> = new Map();

  public createUser(token: string): WebRTCUserService {
    const user = new WebRTCUserService(token);
    this.users.set(token, user);

    return user;
  }

  public getUser(token: string): WebRTCUserService | null {
    return this.users.get(token) ?? null;
  }
}
