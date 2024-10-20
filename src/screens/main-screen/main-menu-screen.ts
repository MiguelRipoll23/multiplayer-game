import { GameController } from "../../models/game-controller.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { MessageObject } from "../../objects/common/message-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { WindowObject } from "../../objects/common/window-object.js";
import { NewsObject } from "../../objects/news-object.js";
import { ApiService } from "../../services/api-service.js";
import { NewsResponse } from "../../services/interfaces/news-response.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";

export class MainMenuScreen extends BaseGameScreen {
  private MENU_OPTIONS_TEXT: string[] = ["Automatch", "Scoreboard", "Settings"];

  private apiService: ApiService;

  private newsResponse: NewsResponse[] | null = null;

  private messageObject: MessageObject | null = null;
  private newsObject: NewsObject | null = null;

  constructor(private readonly gameController: GameController) {
    super(gameController);
    this.apiService = gameController.getApiService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMenuOptionObjects();
    this.loadNewsObject();
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.enableMenuOptions();
    this.downloadNews();
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

  private loadNewsObject(): void {
    this.newsObject = new NewsObject(this.canvas);
    this.newsObject.load();

    this.uiObjects.push(this.newsObject);
  }

  private enableMenuOptions(): void {
    this.uiObjects
      .filter((object) => object instanceof MenuOptionObject)
      .forEach((object) => object.setActive(true));
  }

  private downloadNews(): void {
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
      return this.newsObject?.setActive(false);
    }

    const item = this.newsResponse[index];
    console.log(`Showing news post ${index}: ${item.title}`);

    this.newsObject?.openPost(index, item.title, item.content);
  }

  private handleNewsWindowObject() {
    if (this.newsObject?.isHidden()) {
      const index = this.newsObject.getIndex() + 1;
      this.showPost(index);
    }

    if (this.newsObject?.isPressed()) {
      this.newsObject.close();
    }
  }

  private handleMenuOptionObjects(): void {
    this.uiObjects.forEach((uiObject) => {
      if (uiObject instanceof MenuOptionObject && uiObject.isPressed()) {
        this.handleMenuOption(uiObject);
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
