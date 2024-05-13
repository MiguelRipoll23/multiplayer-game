import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { TitleObject } from "../../objects/title-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";
export class BriefingScreen extends BaseGameScreen {
    gameLoop;
    progressBarObject = null;
    transitionService;
    constructor(gameLoop) {
        super(gameLoop);
        this.gameLoop = gameLoop;
        this.transitionService = gameLoop.getTransitionService();
    }
    loadObjects() {
        this.loadTitleObject();
        this.loadMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        const worldScreen = new WorldScreen(this.gameLoop);
        worldScreen.loadObjects();
        this.progressBarObject?.setProgress(1);
        this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
    }
    loadTitleObject() {
        const titleObject = new TitleObject(this.canvas);
        titleObject.setText("// BRIEFING");
        this.uiObjects.push(titleObject);
    }
    loadMessageObject() {
        this.progressBarObject = new ProgressBarObject(this.canvas);
        this.progressBarObject?.setText("Loading world screen...");
        this.uiObjects.push(this.progressBarObject);
    }
    update(deltaTimeStamp) {
        super.update(deltaTimeStamp);
    }
    render(context) {
        super.render(context);
    }
}
