import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindowObject } from "../../objects/server-message-window-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class MainMenuScreen extends BaseGameScreen {
    MENU_OPTIONS_TEXT = ["Join game", "Scoreboard", "Settings"];
    apiService;
    messagesResponse = null;
    serverMessageWindowObject = null;
    closeableMessageObject = null;
    constructor(gameController) {
        super(gameController);
        this.apiService = gameController.getApiService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMenuOptionObjects();
        this.loadServerMessageWindow();
        this.loadCloseableMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.downloadServerMessages();
    }
    update(deltaTimeStamp) {
        this.handleMenuOptionObjects();
        this.handleServerMessageWindowObject();
        super.update(deltaTimeStamp);
    }
    render(context) {
        super.render(context);
    }
    loadTitleObject() {
        const titleObject = new TitleObject();
        titleObject.setText("MAIN MENU");
        this.uiObjects.push(titleObject);
    }
    loadMenuOptionObjects() {
        let y = 100;
        for (let index = 0; index < this.MENU_OPTIONS_TEXT.length; index++) {
            const text = this.MENU_OPTIONS_TEXT[index];
            const menuOptionObject = new MenuOptionObject(this.canvas, index, text);
            menuOptionObject.setPosition(30, y);
            this.uiObjects.push(menuOptionObject);
            y += menuOptionObject.getHeight() + 25;
        }
    }
    loadCloseableMessageObject() {
        this.closeableMessageObject = new CloseableMessageObject(this.canvas);
        this.uiObjects.push(this.closeableMessageObject);
    }
    loadServerMessageWindow() {
        this.serverMessageWindowObject = new ServerMessageWindowObject(this.canvas);
        this.serverMessageWindowObject.load();
        this.uiObjects.push(this.serverMessageWindowObject);
    }
    downloadServerMessages() {
        this.apiService.getMessages().then((messages) => {
            this.showMessages(messages);
        }).catch((error) => {
            console.error(error);
            this.closeableMessageObject?.show("Failed to download server messages");
        });
    }
    showMessages(messages) {
        this.messagesResponse = messages;
        this.showMessage(0);
    }
    showMessage(index) {
        if (this.messagesResponse === null) {
            return;
        }
        if (index === this.messagesResponse.length) {
            return;
        }
        const item = this.messagesResponse[index];
        console.log("Opening server message message", item);
        this.serverMessageWindowObject?.openMessage(index, item.title, item.content);
    }
    handleServerMessageWindowObject() {
        if (this.serverMessageWindowObject?.isClosed()) {
            const index = this.serverMessageWindowObject.getIndex() + 1;
            this.showMessage(index);
        }
    }
    handleMenuOptionObjects() {
        this.uiObjects.forEach((uiObject) => {
            if (uiObject instanceof MenuOptionObject && uiObject.isPressed()) {
                this.handleMenuOption(uiObject);
            }
        });
    }
    handleMenuOption(menuOptionObject) {
        const index = menuOptionObject.getIndex();
        switch (index) {
            case 0:
                this.transitionToMatchmakingScreen();
                break;
            case 1:
                return this.closeableMessageObject?.show("Not implemented");
            case 2:
                return this.closeableMessageObject?.show("Not implemented");
            default:
                return this.closeableMessageObject?.show("Invalid menu option");
        }
    }
    transitionToMatchmakingScreen() {
        const matchmakingScreen = new MatchmakingScreen(this.gameController);
        matchmakingScreen.loadObjects();
        this.screenManagerService?.getTransitionService().crossfade(matchmakingScreen, 0.2);
    }
}
