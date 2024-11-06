import { BaseGameObject } from "./base/base-game-object.js";
export class PlayerObject extends BaseGameObject {
    name;
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
    setScore(score) {
        this.score = score;
    }
    sumScore(score) {
        this.score += score;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
