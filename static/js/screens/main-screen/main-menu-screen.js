import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { MessageObject } from "../../objects/common/message-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindowObject } from "../../objects/server-message-window-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class MainMenuScreen extends BaseGameScreen {
    MENU_OPTIONS_TEXT = ["Automatch", "Scoreboard", "Settings"];
    apiService;
    messagesResponse = null;
    messageObject = null;
    serverMessageWindowObject = null;
    constructor(gameController) {
        super(gameController);
        this.apiService = gameController.getApiService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMenuOptionObjects();
        this.loadServerMessageWindow();
        this.loadMessageObject();
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
    loadMessageObject() {
        this.messageObject = new MessageObject(this.canvas);
        this.uiObjects.push(this.messageObject);
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
            this.messageObject?.show("Failed to download server messages");
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
            return this.serverMessageWindowObject?.setActive(false);
        }
        const item = this.messagesResponse[index];
        console.log("Opening server message message", item);
        this.serverMessageWindowObject?.openMessage(index, item.title, item.content);
    }
    handleServerMessageWindowObject() {
        if (this.serverMessageWindowObject?.isActive() &&
            this.serverMessageWindowObject?.isHidden()) {
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
                alert("Not implemented");
                break;
            case 2:
                alert("Not implemented");
                break;
            default:
                alert("Invalid menu option index");
        }
    }
    transitionToMatchmakingScreen() {
        const matchmakingScreen = new MatchmakingScreen(this.gameController);
        matchmakingScreen.loadObjects();
        this.screenManagerService?.getTransitionService().crossfade(matchmakingScreen, 0.2);
    }
}
