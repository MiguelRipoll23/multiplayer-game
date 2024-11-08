import { BaseGameScreen } from "./base/base-game-screen.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
export class MainScreen extends BaseGameScreen {
    screen = null;
    constructor(gameController) {
        super(gameController);
    }
    setScreen(screen) {
        this.screen = screen;
        this.updateScreen(screen);
    }
    loadObjects() {
        this.createMainBackgroundObject();
        if (this.screen === null) {
            console.warn("MainScreen: No screen has been set");
        }
        else {
            this.screen?.loadObjects();
            super.loadObjects();
        }
    }
    hasTransitionFinished() {
        this.screen?.hasTransitionFinished();
    }
    update(deltaTimeStamp) {
        // No need to super.update() because the screenManagerService will handle the update
        this.screenManagerService?.getCurrentScreen()?.setOpacity(this.opacity);
        this.screenManagerService?.update(deltaTimeStamp);
    }
    render(context) {
        // Must render the base screen first
        super.render(context);
        this.screenManagerService?.render(context);
    }
    updateScreen(screen) {
        // Set the screen to be fully visible
        this.screen?.setOpacity(1);
        this.screenManagerService = new ScreenManagerService(screen);
        this.screenManagerService.setCurrentScreen(screen);
        this.screen?.setScreenManagerService(this.screenManagerService);
    }
    createMainBackgroundObject() {
        const mainBackgroundObject = new MainBackgroundObject(this.canvas);
        this.sceneObjects.push(mainBackgroundObject);
    }
}
