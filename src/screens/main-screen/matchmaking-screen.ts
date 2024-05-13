import { MessageObject } from "../../objects/message-object.js";
import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { GameLoopService } from "../../services/game-loop-service.js";
import { TransitionService } from "../../services/transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";

export class MatchmakingScreen extends BaseGameScreen {
  private progressBarObject: ProgressBarObject | null = null;

  private transitionService: TransitionService;

  constructor(private readonly gameLoop: GameLoopService) {
    super(gameLoop);
    this.transitionService = gameLoop.getTransitionService();
  }

  public override loadObjects(): void {
    this.loadMessageObject();
    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    const worldScreen = new WorldScreen(this.gameLoop);
    worldScreen.loadObjects();

    this.progressBarObject?.setProgress(1);
    this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
  }

  private loadMessageObject(): void {
    this.progressBarObject = new ProgressBarObject(this.canvas);
    this.progressBarObject?.setText("Loading world screen...");
    this.sceneObjects.push(this.progressBarObject);
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }
}
