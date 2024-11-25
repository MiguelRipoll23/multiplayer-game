import { BaseGameScreen } from "./base/base-game-screen.js";
import { TitleObject } from "../objects/common/title-object.js";
import { ApiService } from "../services/api-service.js";
import { RankingResponse } from "../services/interfaces/response/ranking-response.js";
import { GameController } from "../models/game-controller.js";

export class ScoreboardScreen extends BaseGameScreen {
  private titleObject: TitleObject;
  private ranking: RankingResponse[] = [];

  constructor(gameController: GameController) {
    super(gameController);
    this.titleObject = new TitleObject();
    this.titleObject.setText("Scoreboard");
  }

  public override loadObjects(): void {
    this.uiObjects.push(this.titleObject);
    super.loadObjects();
  }

  public override hasTransitionFinished(): void {
    super.hasTransitionFinished();
    this.fetchRanking();
  }

  private fetchRanking(): void {
    const apiService = this.gameController.getApiService();
    apiService.getRanking().then((ranking) => {
      this.ranking = ranking;
      this.renderTable();
    }).catch((error) => {
      console.error("Failed to fetch ranking", error);
    });
  }

  private renderTable(): void {
    const context = this.canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.titleObject.render(context);

    context.fillStyle = "white";
    context.font = "lighter 20px system-ui";
    context.textAlign = "left";

    const startX = 30;
    let startY = 100;

    context.fillText("Player Name", startX, startY);
    context.fillText("Score", startX + 200, startY);

    startY += 30;

    this.ranking.forEach((player) => {
      context.fillText(player.player_name, startX, startY);
      context.fillText(player.total_score.toString(), startX + 200, startY);
      startY += 30;
    });
  }

  public override render(context: CanvasRenderingContext2D): void {
    this.renderTable();
    super.render(context);
  }
}
