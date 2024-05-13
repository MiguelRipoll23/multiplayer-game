import { GameScreen } from "../screens/interfaces/game-screen.js";
import { ScreenManager } from "../screens/interfaces/screen-manager.js";
import { TransitionService } from "./transition-service.js";

export class ScreenManagerService implements ScreenManager {
  private stack: GameScreen[] = [];
  private currentScreen: GameScreen | null = null;
  private nextScreen: GameScreen | null = null;

  private transitionService: TransitionService;

  constructor() {
    this.transitionService = new TransitionService(this);
  }

  public getTransitionService(): TransitionService {
    return this.transitionService;
  }

  public getPreviousScreen(): GameScreen | null {
    if (this.currentScreen === null) {
      return null;
    }

    const index = this.stack.indexOf(this.currentScreen) - 1;

    return this.stack[index - 1] || null;
  }

  public getCurrentScreen(): GameScreen | null {
    return this.currentScreen;
  }

  public getNextScreen(): GameScreen | null {
    return this.nextScreen;
  }

  public setCurrentScreen(currentScreen: GameScreen): void {
    this.currentScreen = currentScreen;
  }

  public setNextScreen(nextScreen: GameScreen | null): void {
    if (nextScreen !== null) {
      this.stack.push(nextScreen);
    }

    this.nextScreen = nextScreen;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.transitionService.update(deltaTimeStamp);

    this.currentScreen?.update(deltaTimeStamp);
    this.nextScreen?.update(deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    this.currentScreen?.render(context);
    this.nextScreen?.render(context);
  }
}
