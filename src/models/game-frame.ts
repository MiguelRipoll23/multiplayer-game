import { GameScreen } from "../screens/interfaces/game-screen.js";

export class GameFrame {
  private currentScreen: GameScreen | null = null;
  private nextScreen: GameScreen | null = null;

  public getCurrentScreen(): GameScreen | null {
    return this.currentScreen;
  }

  public getNextScreen(): GameScreen | null {
    return this.nextScreen;
  }

  public setCurrentScreen(screen: GameScreen): void {
    this.currentScreen = screen;
  }

  public setNextScreen(screen: GameScreen | null): void {
    this.nextScreen = screen;
  }
}
