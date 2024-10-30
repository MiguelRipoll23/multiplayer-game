import { GamePlayer } from "../models/game-player.js";
import { PlayerObject } from "./player-object.js";

export class LocalPlayerObject extends PlayerObject {
  constructor(protected gamePlayer: GamePlayer) {
    super(gamePlayer.getName());
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {}

  public render(context: CanvasRenderingContext2D): void {
    if (this.debug) {
      this.renderDebugInformation(context);
    }
  }

  private renderDebugInformation(context: CanvasRenderingContext2D) {
    this.renderDebugScoreInformation(context);
  }

  private renderDebugScoreInformation(context: CanvasRenderingContext2D) {
    const score = this.gamePlayer.getScore();

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 60, 40, 10);
    context.fillStyle = "#FFFF00";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(`Score: ${score}`, 28, 68);
  }
}
