export class GameServer {
    gameRegistration = null;
    connected = false;
    getGameRegistration() {
        return this.gameRegistration;
    }
    setGameRegistration(gameRegistration) {
        this.gameRegistration = gameRegistration;
    }
    isConnected() {
        return this.connected;
    }
    setConnected(connected) {
        this.connected = connected;
    }
}
