import { MenuOptionObject } from "../../objects/common/menu-option-object.js";
import { MessageObject } from "../../objects/common/message-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { ServerMessageWindow } from "../../objects/server-message-window-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class MainMenuScreen extends BaseGameScreen {
    MENU_OPTIONS_TEXT = ["Automatch", "Scoreboard", "Settings"];
    apiService;
    newsResponse = null;
    messageObject = null;
    newsWindowObject = null;
    constructor(gameController) {
        super(gameController);
        this.apiService = gameController.getApiService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMenuOptionObjects();
        this.loadNewsWindowObject();
        this.loadMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.downloadNews();
    }
    update(deltaTimeStamp) {
        this.handleMenuOptionObjects();
        this.handleNewsWindowObject();
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
    loadNewsWindowObject() {
        this.newsWindowObject = new ServerMessageWindow(this.canvas);
        this.newsWindowObject.load();
        this.uiObjects.push(this.newsWindowObject);
    }
    downloadNews() {
        this.apiService.getNews().then((news) => {
            this.showPosts(news);
        }).catch((error) => {
            console.error(error);
            this.messageObject?.show("Failed to download news");
        });
    }
    showPosts(news) {
        this.newsResponse = news;
        this.showPost(0);
    }
    showPost(index) {
        if (this.newsResponse === null) {
            return;
        }
        if (index === this.newsResponse.length) {
            return this.newsWindowObject?.setActive(false);
        }
        const item = this.newsResponse[index];
        console.log("Opening news post", item);
        this.newsWindowObject?.openPost(index, item.title, item.content);
    }
    handleNewsWindowObject() {
        if (this.newsWindowObject?.isActive() &&
            this.newsWindowObject?.isHidden()) {
            const index = this.newsWindowObject.getIndex() + 1;
            this.showPost(index);
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
