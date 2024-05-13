import { BaseGameScreen } from "./base/base-game-screen.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { LoginScreen } from "./main-screen/login-screen.js";
import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
export class MainScreen extends BaseGameScreen {
    gameController;
    loginScreen;
    constructor(gameController) {
        super(gameController);
        this.gameController = gameController;
        this.loginScreen = new LoginScreen(this.gameController);
        this.loginScreen.setOpacity(1);
        this.screenManagerService = new ScreenManagerService(this.loginScreen);
        this.screenManagerService.setCurrentScreen(this.loginScreen);
        this.loginScreen.setScreenManagerService(this.screenManagerService);
    }
    loadObjects() {
        this.createMainBrackgroundObject();
        this.loginScreen.loadObjects();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.loginScreen.hasTransitionFinished();
    }
    update(deltaTimeStamp) {
        super.update(deltaTimeStamp);
        this.screenManagerService?.getCurrentScreen()?.setOpacity(this.opacity);
        this.screenManagerService?.update(deltaTimeStamp);
    }
    render(context) {
        super.render(context);
        this.screenManagerService?.render(context);
    }
    createMainBrackgroundObject() {
        const mainBackgroundObject = new MainBackgroundObject(this.canvas);
        this.sceneObjects.push(mainBackgroundObject);
    }
}
