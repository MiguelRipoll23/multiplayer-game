import { WebRTCUser } from "../models/webrtc-user.js";
export class WebRTCService {
    users = new Map();
    createUser(token) {
        const user = new WebRTCUser(token);
        this.users.set(token, user);
        return user;
    }
    getUser(token) {
        return this.users.get(token) ?? null;
    }
}
