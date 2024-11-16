import { BaseGameObject } from "./base/base-game-object.js";
export class PlayerObject extends BaseGameObject {
    gamePlayer;
    score = 0;
    constructor(gamePlayer) {
        super();
        this.gamePlayer = gamePlayer;
    }
    getName() {
        return this.gamePlayer.getName();
    }
    getScore() {
        return this.score;
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
