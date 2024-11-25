import { GameController } from "../../models/game-controller.js";
import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindowObject } from "../../objects/server-message-window-object.js";
import { ApiService } from "../../services/api-service.js";
import { MessagesResponse } from "../../services/interfaces/response/messages-response.js";
import { ScreenTransitionService } from "../../services/screen-transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { LoadingScreen } from "./loading-screen.js";
import { ScoreboardScreen } from "../scoreboard-screen.js";

export class MainMenuScreen extends BaseGameScreen {
  private MENU_OPTIONS_TEXT: string[] = ["Join game", "Scoreboard", "Settings"];

  private apiService: ApiService;
  private transitionService: ScreenTransitionService;

  private messagesResponse: MessagesResponse[] | null = null;

  private serverMessageWindowObject: ServerMessageWindowObject | null = null;
  private closeableMessageObject: CloseableMessageObject | null = null;

  constructor(gameController: GameController, private downloadNews = true) {
    super(gameController);
    this.apiService = gameController.getApiService();
    this.transitionService = gameController.getTransitionService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMenuOptionObjects();
    this.loadServerMessageWindow();
    this.loadCloseableMessageObject();

    super.loadObjects();
  }

  public override hasTransitionFinished(): void {
    super.hasTransitionFinished();

    if (this.downloadNews) {
      this.downloadServerMessages();
    }
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleMenuOptionObjects();
    this.handleServerMessageWindowObject();

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }

  private loadTitleObject(): void {
    const titleObject = new TitleObject();
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

      y += menuOptionObject.getHeight() + 30;
    }
  }

  private loadCloseableMessageObject(): void {
    this.closeableMessageObject = new CloseableMessageObject(this.canvas);
    this.uiObjects.push(this.closeableMessageObject);
  }

  private loadServerMessageWindow(): void {
    this.serverMessageWindowObject = new ServerMessageWindowObject(this.canvas);
    this.serverMessageWindowObject.load();

    this.uiObjects.push(this.serverMessageWindowObject);
  }

  private downloadServerMessages(): void {
    this.apiService
      .getMessages()
      .then((messages) => {
        this.showMessages(messages);
      })
      .catch((error) => {
        console.error(error);
        this.closeableMessageObject?.show("Failed to download server messages");
      });
  }

  private showMessages(messages: MessagesResponse[]): void {
    if (messages.length === 0) {
      return console.log("No server messages to show");
    }

    this.messagesResponse = messages;
    this.showMessage(0);
  }

  private showMessage(index: number): void {
    if (this.messagesResponse === null) {
      return;
    }

    if (index === this.messagesResponse.length) {
      if (this.serverMessageWindowObject?.isOpened()) {
        this.serverMessageWindowObject?.closeAll();
      }

      return;
    }

    const item = this.messagesResponse[index];
    const length = this.messagesResponse.length;

    this.serverMessageWindowObject?.openMessage(
      index,
      length,
      item.title,
      item.content
    );
  }

  private handleServerMessageWindowObject() {
    if (this.serverMessageWindowObject?.getNext()) {
      const index = this.serverMessageWindowObject.getIndex() + 1;
      this.showMessage(index);
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
        this.transitionToLoadingScreen();
        break;

      case 1:
        this.transitionToScoreboardScreen();
        break;

      case 2:
        return this.closeableMessageObject?.show("Not implemented");

      default:
        return this.closeableMessageObject?.show("Invalid menu option");
    }
  }

  private transitionToLoadingScreen(): void {
    this.uiObjects.forEach((uiObject) => {
      if (uiObject instanceof MenuOptionObject) {
        uiObject.setActive(false);
      }
    });

    const loadingScreen = new LoadingScreen(this.gameController);
    loadingScreen.loadObjects();

    this.transitionService.crossfade(loadingScreen, 0.2);
  }

  private transitionToScoreboardScreen(): void {
    this.uiObjects.forEach((uiObject) => {
      if (uiObject instanceof MenuOptionObject) {
        uiObject.setActive(false);
      }
    });

    const scoreboardScreen = new ScoreboardScreen(this.gameController);
    scoreboardScreen.loadObjects();

    this.transitionService.crossfade(scoreboardScreen, 0.2);
  }
}
