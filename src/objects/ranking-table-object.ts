import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
import { RankingResponse } from "../services/interfaces/response/ranking-response.js";

export class RankingTableObject extends BaseAnimatedGameObject {
  private ranking: RankingResponse[] = [];

  public setRanking(ranking: RankingResponse[]): void {
    this.ranking = ranking;
  }

  public render(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = this.opacity;

    context.font = "bold 24px system-ui";
    context.textAlign = "left";

    const startX = 30;
    let startY = 100;

    this.ranking.forEach((player, index) => {
      context.fillStyle = index % 2 === 0 ? "white" : "#BDBDBD";
      context.fillText(player.player_name, startX, startY);
      context.fillText(player.total_score.toString(), context.canvas.width - 40, startY);
      startY += 30;
    });

    context.restore();
  }

  public fadeIn(seconds: number): void {
    super.fadeIn(seconds);
  }
}
