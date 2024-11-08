import { Team } from "./game-teams.js";
export class GamePlayer {
    name;
    team;
    score;
    constructor(name = "Unknown", team = Team.Blue, score = 0) {
        this.name = name;
        this.team = team;
        this.score = score;
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
