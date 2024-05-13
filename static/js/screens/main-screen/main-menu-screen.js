import { MessageObject } from "../../objects/message-object.js";
import { TitleObject } from "../../objects/title-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class MainMenuScreen extends BaseGameScreen {
    gameController;
    apiService;
    messageObject = null;
    constructor(gameController) {
        super(gameController);
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.loadNews();
    }
    loadTitleObject() {
        const titleObject = new TitleObject(this.canvas);
        titleObject.setText("MAIN MENU");
        this.uiObjects.push(titleObject);
    }
    loadMessageObject() {
        this.messageObject = new MessageObject(this.canvas);
        this.uiObjects.push(this.messageObject);
    }
    loadNews() {
        this.apiService.getNews().then((news) => {
            this.transitionToMatchmakingScreen();
        }).catch((error) => {
            console.error(error);
            this.messageObject?.show("Failed to download news");
        });
    }
    transitionToMatchmakingScreen() {
        const matchmakingScreen = new MatchmakingScreen(this.gameController);
        matchmakingScreen.loadObjects();
        this.screenManagerService?.getTransitionService().crossfade(matchmakingScreen, 0.2);
    }
}
