import { WebRTCUser } from "../models/webrtc-user.js";

export class WebRTCService {
  private users: Map<string, WebRTCUser> = new Map();

  public createUser(token: string): WebRTCUser {
    const user = new WebRTCUser(token);
    this.users.set(token, user);

    return user;
  }

  public getUser(token: string): WebRTCUser | null {
    return this.users.get(token) ?? null;
  }
}
