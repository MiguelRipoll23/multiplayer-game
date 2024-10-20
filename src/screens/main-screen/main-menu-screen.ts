import { GameController } from "../../models/game-controller.js";
import { MenuOptionObject } from "../../objects/menu-option-object.js";
import { MessageObject } from "../../objects/message-object.js";
import { TitleObject } from "../../objects/title-object.js";
import { WindowObject } from "../../objects/window-object.js";
import { ApiService } from "../../services/api-service.js";
import { NewsResponse } from "../../services/interfaces/news-response.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";

export class MainMenuScreen extends BaseGameScreen {
  private MENU_OPTIONS_TEXT: string[] = ["Automatch", "Scoreboard", "Settings"];

  private apiService: ApiService;

  private newsResponse: NewsResponse[] | null = null;

  private messageObject: MessageObject | null = null;
  private newsWindowObject: WindowObject | null = null;

  constructor(private readonly gameController: GameController) {
    super(gameController);
    this.apiService = gameController.getApiService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMenuOptionObjects();
    this.loadNewsWindowObject();
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.loadNews();
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleMenuOptionObjects();
    this.handleNewsWindowObject();

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }

  private loadTitleObject(): void {
    const titleObject = new TitleObject(this.canvas);
    titleObject.setText("MAIN MENU");
    this.uiObjects.push(titleObject);
  }

  private loadMenuOptionObjects(): void {
    let y = 100;

    for (let index = 0; index < this.MENU_OPTIONS_TEXT.length; index++) {
      const text = this.MENU_OPTIONS_TEXT[index];

      const menuOptionObject = new MenuOptionObject(this.canvas, index, text);
      menuOptionObject.setPosition(30, y);

      this.uiObjects.push(menuOptionObject);

      y += menuOptionObject.getHeight() + 25;
    }
  }

  private loadMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  private loadNewsWindowObject(): void {
    this.newsWindowObject = new WindowObject(this.canvas);
    this.newsWindowObject.load();

    this.uiObjects.push(this.newsWindowObject);
  }

  private loadNews(): void {
    this.apiService.getNews().then((news) => {
      this.showPosts(news);
    }).catch((error) => {
      console.error(error);
      this.messageObject?.show("Failed to download news");
    });
  }

  private showPosts(news: NewsResponse[]): void {
    this.newsResponse = news;
    this.showPost(0);
  }

  private showPost(index: number): void {
    if (this.newsResponse === null) {
      return;
    }

    if (index === this.newsResponse.length) {
      this.enableMenuOptionObjects();
      return;
    }

    const item = this.newsResponse[index];
    this.newsWindowObject?.show(index, item.title, item.content);
  }

  private handleNewsWindowObject() {
    if (this.newsWindowObject?.isHidden()) {
      const index = this.newsWindowObject.getIndex() + 1;
      this.showPost(index);
    }
  }

  private enableMenuOptionObjects(): void {
    this.uiObjects.forEach((uiObject) => {
      if (uiObject instanceof MenuOptionObject) {
        uiObject.setActive(true);
      }
    });
  }

  private handleMenuOptionObjects(): void {
    this.uiObjects.forEach((uiObject) => {
      if (uiObject instanceof MenuOptionObject && uiObject.isPressed()) {
        this.handleMenuOption(uiObject);
        uiObject.reset();
      }
    });
  }

  private handleMenuOption(menuOptionObject: MenuOptionObject): void {
    const index = menuOptionObject.getIndex();

    switch (index) {
      case 0:
        this.transitionToMatchmakingScreen();
        break;

      case 1:
        alert("Not implemented");
        break;

      case 2:
        alert("Not implemented");
        break;

      default:
        alert("Invalid menu option index");
    }
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
