import { GameController } from "../../models/game-controller.js";
import { MessageObject } from "../../objects/message-object.js";
import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { TitleObject } from "../../objects/title-object.js";
import { ApiService } from "../../services/api-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";

export class MainMenuScreen extends BaseGameScreen {
  private apiService: ApiService;

  private messageObject: MessageObject | null = null;

  constructor(private readonly gameController: GameController) {
    super(gameController);
    this.apiService = gameController.getApiService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.loadNews();
  }

  private loadTitleObject(): void {
    const titleObject = new TitleObject(this.canvas);
    titleObject.setText("MAIN MENU");
    this.uiObjects.push(titleObject);
  }

  private loadMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  private loadNews(): void {
    this.apiService.getNews().then((news) => {
      this.transitionToMatchmakingScreen();
    }).catch((error) => {
      console.error(error);
      this.messageObject?.show("Failed to download news");
    });
  }

  private transitionToMatchmakingScreen(): void {
    const matchmakingScreen = new MatchmakingScreen(this.gameController);
    matchmakingScreen.loadObjects();

    this.screenManagerService?.getTransitionService().crossfade(
      matchmakingScreen,
      0.2,
    );
  }
}
