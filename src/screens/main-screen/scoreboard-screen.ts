import { GameController } from "../../models/game-controller.js";
import { ButtonObject } from "../../objects/common/button-object.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { RankingResponse } from "../../services/interfaces/response/ranking-response.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";

export class ScoreboardScreen extends BaseGameScreen {
  private titleObject: TitleObject | null = null;
  private buttonObject: ButtonObject | null = null;
  private ranking: RankingResponse[] = [];
  private closeableMessageObject: CloseableMessageObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadButtonObject();
    this.loadCloseableMessageObject();
    super.loadObjects();
  }

  public override hasTransitionFinished(): void {
    super.hasTransitionFinished();
    this.fetchRanking();
  }

  private loadTitleObject(): void {
    this.titleObject = new TitleObject();
    this.titleObject.setText("SCOREBOARD");
    this.uiObjects.push(this.titleObject);
  }

  public loadButtonObject(): void {
    this.buttonObject = new ButtonObject(this.canvas, "Back");
    this.buttonObject.setPosition(
      this.canvas.width / 2,
      this.canvas.height - 60 - 20
    );
    this.uiObjects.push(this.buttonObject);
  }

  private loadCloseableMessageObject(): void {
    this.closeableMessageObject = new CloseableMessageObject(this.canvas);
    this.uiObjects.push(this.closeableMessageObject);
  }

  private fetchRanking(): void {
    const apiService = this.gameController.getApiService();
    apiService
      .getRanking()
      .then((ranking) => {
        this.ranking = ranking;
      })
      .catch((error) => {
        console.error("Failed to fetch ranking", error);
        this.closeableMessageObject?.show("Failed to fetch ranking");
      });
  }

  private renderTable(context: CanvasRenderingContext2D): void {
    context.font = "lighter 24px system-ui";
    context.textAlign = "left";

    const startX = 30;
    let startY = 100;

    this.ranking.forEach((player, index) => {
      context.fillStyle = index % 2 === 0 ? "white" : "lightgray";
      context.fillText(player.player_name, startX, startY);
      context.fillText(player.total_score.toString(), this.canvas.width - 40, startY);
      startY += 30;
    });
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.buttonObject?.isPressed()) {
      this.returnMainMenu();
    }

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();
    this.renderTable(context);
    super.render(context);
    context.restore();
  }

  private returnMainMenu(): void {
    const previousScreen =
      this.screenManagerService?.getPreviousScreen() ?? null;

    if (previousScreen === null) {
      return;
    }

    console.log("Returning to", previousScreen.constructor.name);

    this.screenManagerService
      ?.getTransitionService()
      .crossfade(previousScreen, 0.2);
  }
}