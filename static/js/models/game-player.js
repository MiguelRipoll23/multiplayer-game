export class GamePlayer {
    name = "Unknown";
    score = 0;
    getName() {
        return this.name;
    }
    getScore() {
        return this.score;
    }
    setName(name) {
        this.name = name;
    }
    setScore(score) {
        this.score = score;
    }
}
