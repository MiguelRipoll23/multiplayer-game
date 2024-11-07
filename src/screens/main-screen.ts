import { GameLoopService } from "../services/game-loop-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { LoginScreen } from "./main-screen/login-screen.js";
import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
import { GameController } from "../models/game-controller.js";

export class MainScreen extends BaseGameScreen {
  private loginScreen: LoginScreen;

  constructor(gameController: GameController) {
    super(gameController);

    this.loginScreen = new LoginScreen(this.gameController);
    this.updateLoginScreen();
  }

  public override loadObjects(): void {
    this.createMainBackgroundObject();
    this.loginScreen.loadObjects();
    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.loginScreen.hasTransitionFinished();
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No need to super.update() because the screenManagerService will handle the update

    this.screenManagerService?.getCurrentScreen()?.setOpacity(this.opacity);
    this.screenManagerService?.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    // Must render the base screen first
    super.render(context);

    this.screenManagerService?.render(context);
  }

  private updateLoginScreen(): void {
    // Set the login screen to be fully visible
    this.loginScreen.setOpacity(1);

    this.screenManagerService = new ScreenManagerService(this.loginScreen);
    this.screenManagerService.setCurrentScreen(this.loginScreen);

    this.loginScreen.setScreenManagerService(this.screenManagerService);
  }

  private createMainBackgroundObject() {
    const mainBackgroundObject = new MainBackgroundObject(this.canvas);
    this.sceneObjects.push(mainBackgroundObject);
  }
}
