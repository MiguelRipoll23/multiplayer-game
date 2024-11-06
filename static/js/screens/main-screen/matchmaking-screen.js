import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";
export class MatchmakingScreen extends BaseGameScreen {
    transitionService;
    progressBarObject = null;
    worldScreen = null;
    constructor(gameController) {
        super(gameController);
        this.transitionService = gameController.getTransitionService();
    }
    loadObjects() {
        this.loadProgressBarObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.worldScreen = new WorldScreen(this.gameController);
        this.worldScreen.loadObjects();
        this.transitionService.fadeOutAndIn(this.worldScreen, 1, 1);
    }
    update(deltaTimeStamp) {
        const totalObjects = this.worldScreen?.getTotalObjectsCount() || 1;
        const loadedObjects = this.worldScreen?.getLoadedObjectsCount() || 0;
        this.progressBarObject?.setProgress(loadedObjects / totalObjects);
        super.update(deltaTimeStamp);
    }
    loadProgressBarObject() {
        this.progressBarObject = new ProgressBarObject(this.canvas);
        this.progressBarObject?.setText("Loading world screen....");
        this.uiObjects.push(this.progressBarObject);
    }
}
