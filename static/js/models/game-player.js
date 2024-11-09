import { Team } from "./game-teams.js";
export class GamePlayer {
    id;
    host;
    name;
    team;
    score;
    constructor(id = self.crypto.randomUUID(), host = false, name = "Unknown", team = Team.Blue, score = 0) {
        this.id = id;
        this.host = host;
        this.name = name;
        this.team = team;
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
    getTeam() {
        return this.team;
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
