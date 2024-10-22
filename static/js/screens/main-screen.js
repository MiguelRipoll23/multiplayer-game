import { BaseGameScreen } from "./base/base-game-screen.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { LoginScreen } from "./main-screen/login-screen.js";
import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
export class MainScreen extends BaseGameScreen {
    loginScreen;
    constructor(gameController) {
        super(gameController);
        this.loginScreen = new LoginScreen(this.gameController);
        this.updateLoginScreen();
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
        // No need to super.update() because the screenManagerService will handle the update
        this.screenManagerService?.getCurrentScreen()?.setOpacity(this.opacity);
        this.screenManagerService?.update(deltaTimeStamp);
    }
    render(context) {
        // Must render the base screen first
        super.render(context);
        this.screenManagerService?.render(context);
    }
    updateLoginScreen() {
        // Set the login screen to be fully visible
        this.loginScreen.setOpacity(1);
        this.screenManagerService = new ScreenManagerService(this.loginScreen);
        this.screenManagerService.setCurrentScreen(this.loginScreen);
        this.loginScreen.setScreenManagerService(this.screenManagerService);
    }
    createMainBrackgroundObject() {
        const mainBackgroundObject = new MainBackgroundObject(this.canvas);
        this.sceneObjects.push(mainBackgroundObject);
    }
}
