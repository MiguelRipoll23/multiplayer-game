export class GameRegistration {
    authenticationToken;
    sessionKey;
    userId;
    publicIp;
    constructor(registrationResponse) {
        this.authenticationToken = registrationResponse.authentication_token;
        this.sessionKey = registrationResponse.session_key;
        this.userId = registrationResponse.user_id;
        this.publicIp = registrationResponse.public_ip;
    }
    getAuthenticationToken() {
        return this.authenticationToken;
    }
    getSessionKey() {
        return this.sessionKey;
    }
    getUserId() {
        return this.userId;
    }
    getPublicIp() {
        return this.publicIp;
    }
}
