import { WebRTCUserService } from "./webrtc-user-service.js";
export class WebRTCService {
    users = new Map();
    createUser(token) {
        const user = new WebRTCUserService(token);
        this.users.set(token, user);
        return user;
    }
    getUser(token) {
        return this.users.get(token) ?? null;
    }
}
