export class GameMatch {
    host;
    totalSlots;
    attributes;
    players = new Map();
    constructor(host, totalSlots, attributes) {
        this.host = host;
        this.totalSlots = totalSlots;
        this.attributes = attributes;
    }
    isHost() {
        return this.host;
    }
    getTotalSlots() {
        return this.totalSlots;
    }
    getAvailableSlots() {
        return this.totalSlots - this.players.size;
    }
    getAttributes() {
        return this.attributes;
    }
    addPlayer(player) {
        this.players.set(player.getName(), player);
        console.log(`Added player ${player.getName()} to match, total players`, this.players.size);
    }
    removePlayer(playerName) {
        this.players.delete(playerName);
        console.log(`Removed player ${playerName} from match, total players`, this.players.size);
    }
}
