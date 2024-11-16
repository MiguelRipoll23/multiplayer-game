export class GamePlayer {
    id;
    host;
    name;
    score;
    constructor(id = self.crypto.randomUUID(), host = false, name = "Unknown", score = 0) {
        this.id = id;
        this.host = host;
        this.name = name;
        this.score = score;
    }
    getId() {
        return this.id;
    }
    isHost() {
        return this.host;
    }
    setHost(host) {
        this.host = host;
    }
    getName() {
        return this.name;
    }
    getScore() {
        return this.score;
    }
    setName(name) {
        this.name = name;
    }
    sumScore(score) {
        this.score += score;
    }
    setScore(score) {
        this.score = score;
    }
}
