export class GameServer {
    gameRegistration = null;
    configuration = null;
    connected = false;
    getGameRegistration() {
        return this.gameRegistration;
    }
    setGameRegistration(gameRegistration) {
        this.gameRegistration = gameRegistration;
    }
    getConfiguration() {
        return this.configuration;
    }
    setConfiguration(configuration) {
        this.configuration = configuration;
    }
    isConnected() {
        return this.connected;
    }
    setConnected(connected) {
        this.connected = connected;
    }
}
