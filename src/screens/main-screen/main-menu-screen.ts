import { GameController } from "../../models/game-controller.js";
import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindowObject } from "../../objects/server-message-window-object.js";
import { ApiService } from "../../services/api-service.js";
import { MessagesResponse } from "../../services/interfaces/messages-response.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";

export class MainMenuScreen extends BaseGameScreen {
  private MENU_OPTIONS_TEXT: string[] = ["Automatch", "Scoreboard", "Settings"];

  private apiService: ApiService;

  private messagesResponse: MessagesResponse[] | null = null;
  private serverMessageWindowObject: ServerMessageWindowObject | null = null;

  private closeableMessageObject: CloseableMessageObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);
    this.apiService = gameController.getApiService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMenuOptionObjects();
    this.loadServerMessageWindow();
    this.loadCloseableMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.downloadServerMessages();
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

      y += menuOptionObject.getHeight() + 25;
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
    this.apiService.getMessages().then((messages) => {
      this.showMessages(messages);
    }).catch((error) => {
      console.error(error);
      this.closeableMessageObject?.show("Failed to download server messages");
    });
  }

  private showMessages(messages: MessagesResponse[]): void {
    this.messagesResponse = messages;
    this.showMessage(0);
  }

  private showMessage(index: number): void {
    if (this.messagesResponse === null) {
      return;
    }

    if (index === this.messagesResponse.length) {
      return this.serverMessageWindowObject?.setActive(false);
    }

    const item = this.messagesResponse[index];
    console.log("Opening server message message", item);

    this.serverMessageWindowObject?.openMessage(
      index,
      item.title,
      item.content,
    );
  }

  private handleServerMessageWindowObject() {
    if (
      this.serverMessageWindowObject?.isActive() &&
      this.serverMessageWindowObject?.isHidden()
    ) {
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