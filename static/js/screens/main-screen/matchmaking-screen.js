import { ProgressBarObject } from "../../objects/progress-bar-object.js";
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
        this.loadProgressBarObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        const worldScreen = new WorldScreen(this.gameController);
        worldScreen.loadObjects();
        this.progressBarObject?.setProgress(1);
        this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
    }
    loadProgressBarObject() {
        this.progressBarObject = new ProgressBarObject(this.canvas);
        this.progressBarObject?.setText("Loading world screen....");
        this.uiObjects.push(this.progressBarObject);
    }
}
