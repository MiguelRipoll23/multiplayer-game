import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";
export class MatchmakingScreen extends BaseGameScreen {
    transitionService;
    progressBarObject = null;
    constructor(gameController) {
        super(gameController);
        this.transitionService = gameController.getTransitionService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.progressBarObject?.setText("Loading world screen...");
        this.progressBarObject?.setProgress(0.5);
        const worldScreen = new WorldScreen(this.gameController);
        worldScreen.loadObjects();
        this.progressBarObject?.setProgress(1);
        this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
    }
    loadTitleObject() {
        const titleObject = new TitleObject(this.canvas);
        titleObject.setText("MATCHMAKING");
        this.uiObjects.push(titleObject);
    }
    loadMessageObject() {
        this.progressBarObject = new ProgressBarObject(this.canvas);
        this.progressBarObject?.setText("Finding sesions...");
        this.uiObjects.push(this.progressBarObject);
    }
}
