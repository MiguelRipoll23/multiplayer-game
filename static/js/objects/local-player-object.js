import { PlayerObject } from "./player-object.js";
export class LocalPlayerObject extends PlayerObject {
    gamePlayer;
    constructor(gamePlayer) {
        super(gamePlayer.getName());
        this.gamePlayer = gamePlayer;
    }
    update(deltaTimeStamp) { }
    render(context) {
        if (this.debug) {
            this.renderDebugInformation(context);
        }
    }
    renderDebugInformation(context) {
        this.renderDebugScoreInformation(context);
    }
    renderDebugScoreInformation(context) {
        const score = this.gamePlayer.getScore();
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(24, 72, 80, 20);
        context.fillStyle = "#FFFF00";
        context.font = "12px system-ui";
        context.textAlign = "left";
        context.fillText(`Score: ${score}`, 30, 86);
    }
}
