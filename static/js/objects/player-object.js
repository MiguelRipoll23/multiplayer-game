import { Team } from "../models/game-teams.js";
import { BaseGameObject } from "./base/base-game-object.js";
export class PlayerObject extends BaseGameObject {
    name;
    team = Team.Blue;
    score = 0;
    constructor(name) {
        super();
        this.name = name;
    }
    getName() {
        return this.name;
    }
    getScore() {
        return this.score;
    }
    getTeam() {
        return this.team;
    }
    setTeam(team) {
        this.team = team;
    }
    setScore(score) {
        this.score = score;
    }
    sumScore(score) {
        this.score += score;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
