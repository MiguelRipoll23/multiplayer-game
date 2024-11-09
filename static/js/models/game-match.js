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
    getPlayers() {
        return Array.from(this.players.values());
    }
    getPlayer(id) {
        return this.players.get(id);
    }
    addPlayer(player) {
        this.players.set(player.getId(), player);
        console.log(`Added player ${player.getName()} to match, total players`, this.players.size);
    }
    removePlayer(id) {
        this.players.delete(id);
        console.log(`Removed player ${id} from match, total players`, this.players.size);
    }
    getPlayerName(id) {
        if (id === null) {
            return "Unknown";
        }
        const player = this.players.get(id);
        if (player === undefined) {
            return id;
        }
        return player.getName();
    }
}
