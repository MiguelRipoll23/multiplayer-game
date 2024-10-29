import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindowObject } from "../../objects/server-message-window-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class MainMenuScreen extends BaseGameScreen {
    MENU_OPTIONS_TEXT = ["Join game", "Scoreboard", "Settings"];
    apiService;
    transitionService;
    messagesResponse = null;
    serverMessageWindowObject = null;
    errorCloseableMessageObject = null;
    constructor(gameController) {
        super(gameController);
        this.apiService = gameController.getApiService();
        this.transitionService = gameController.getTransitionService();
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
        this.handleErrorMessageObject();
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
        this.errorCloseableMessageObject = new CloseableMessageObject(this.canvas);
        this.uiObjects.push(this.errorCloseableMessageObject);
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
            this.errorCloseableMessageObject?.show("Failed to download server messages");
        });
    }
    showMessages(messages) {
        if (messages.length === 0) {
            return console.log("No server messages to show");
        }
        this.messagesResponse = messages;
        this.showMessage(0);
    }
    showMessage(index) {
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
        this.serverMessageWindowObject?.openMessage(index, length, item.title, item.content);
    }
    handleErrorMessageObject() {
        if (this.errorCloseableMessageObject?.isPressed()) {
            console.log("Reloading window");
            window.location.reload();
        }
    }
    handleServerMessageWindowObject() {
        if (this.serverMessageWindowObject?.getNext()) {
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
                return this.errorCloseableMessageObject?.show("Not implemented");
            case 2:
                return this.errorCloseableMessageObject?.show("Not implemented");
            default:
                return this.errorCloseableMessageObject?.show("Invalid menu option");
        }
    }
    transitionToMatchmakingScreen() {
        this.uiObjects.filter((uiObject) => uiObject instanceof MenuOptionObject)
            .forEach((uiObject) => {
            uiObject.setActive(false);
        });
        const matchmakingScreen = new MatchmakingScreen(this.gameController);
        matchmakingScreen.loadObjects();
        this.transitionService.crossfade(matchmakingScreen, 0.2);
    }
}
