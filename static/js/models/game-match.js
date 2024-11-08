export class GameMatch {
    host;
    totalSlots;
    availableSlots;
    attributes;
    constructor(host, totalSlots, attributes) {
        this.host = host;
        this.totalSlots = totalSlots;
        this.availableSlots = totalSlots - 1;
        this.attributes = attributes;
    }
    isHost() {
        return this.host;
    }
    getTotalSlots() {
        return this.totalSlots;
    }
    getAvailableSlots() {
        return this.availableSlots;
    }
    getAttributes() {
        return this.attributes;
    }
    incrementAvailableSlots() {
        this.availableSlots++;
        console.log("Added slot, available slots", this.availableSlots);
    }
    decrementAvailableSlots() {
        this.availableSlots--;
        console.log("Removed slot, available slots", this.availableSlots);
    }
}
