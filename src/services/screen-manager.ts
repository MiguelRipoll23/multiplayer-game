import { GameFrame } from "../entities/game-frame.js";
import { GameScreen } from "../interfaces/game-screen.js";
import { GameLoop } from "./game-loop.js";

export class ScreenManager {
  private gameFrame: GameFrame;

  private fadeInSpeed: number = 0;
  private fadeOutSpeed: number = 0;
  private crossfadeSpeed: number = 0;

  private isFadingOutAndIn: boolean = false;
  private isCrossfading: boolean = false;

  private isTransitioning: boolean = this.isFadingOutAndIn ||
    this.isCrossfading;

  constructor(gameLoop: GameLoop) {
    this.gameFrame = gameLoop.getGameFrame();
  }

  public update(deltaTimeStamp: number): void {
    if (this.isFadingOutAndIn) {
      this.handleFadingOutAndIn(
        deltaTimeStamp,
      );
    } else if (this.isCrossfading) {
      this.handleCrossfading(deltaTimeStamp);
    }
  }

  public isTransitioningScreens(): boolean {
    return this.isTransitioning;
  }

  public fadeOutAndIn(
    nextScreen: GameScreen,
    fadeOutSpeed: number,
    fadeInSpeed: number,
  ): void {
    console.log("Fading out and in to", nextScreen.getId());
    this.isFadingOutAndIn = true;
    this.fadeInSpeed = fadeInSpeed;
    this.fadeOutSpeed = fadeOutSpeed;
    this.gameFrame.setNextScreen(nextScreen);
  }

  public crossfade(nextScreen: GameScreen, crossfadeSpeed: number): void {
    console.log("Crossfading to", nextScreen.getId());

    this.isCrossfading = true;
    this.crossfadeSpeed = crossfadeSpeed;
    this.gameFrame.setNextScreen(nextScreen);
  }

  private handleFadingOutAndIn(
    deltaTime: number,
  ): void {
    const currentScreen = this.gameFrame.getCurrentScreen();
    const nextScreen = this.gameFrame.getNextScreen();

    if (currentScreen === null || nextScreen === null) {
      return;
    }

    this.fadeOutCurrentScreen(deltaTime, currentScreen);

    // Check if the current screen has faded out
    if (currentScreen.getOpacity() === 0) {
      this.fadeInNextScreen(deltaTime, nextScreen);
    }

    this.updateCurrentAndNextScreen(nextScreen);

    this.isFadingOutAndIn = false;
  }

  private fadeOutCurrentScreen(
    deltaTime: number,
    currentScreen: GameScreen,
  ): void {
    const currentScreenOpacity = currentScreen.getOpacity();
    const targetCurrentOpacity = Math.max(
      currentScreenOpacity - this.fadeOutSpeed * deltaTime,
      0,
    );

    currentScreen.setOpacity(targetCurrentOpacity);
  }

  private fadeInNextScreen(deltaTime: number, nextScreen: GameScreen): void {
    const nextScreenOpacity = nextScreen.getOpacity();
    const targetNextScreenOpacity = Math.min(
      nextScreenOpacity + this.fadeInSpeed * deltaTime,
      1,
    );

    nextScreen.setOpacity(targetNextScreenOpacity);
  }

  private handleCrossfading(
    deltaTimeStamp: number,
  ): void {
    const nextScreen = this.gameFrame.getNextScreen();

    if (nextScreen === null) {
      return;
    }

    const opacity = nextScreen.getOpacity();
    const targetOpacity = Math.min(
      opacity + this.crossfadeSpeed * deltaTimeStamp,
      1,
    );

    nextScreen.setOpacity(targetOpacity);

    if (targetOpacity === 1) {
      this.updateCurrentAndNextScreen(nextScreen);
      this.isCrossfading = false;
    }
  }

  private updateCurrentAndNextScreen(nextScreen: GameScreen): void {
    this.gameFrame.setCurrentScreen(nextScreen);
    this.gameFrame.setNextScreen(null);
  }
}
