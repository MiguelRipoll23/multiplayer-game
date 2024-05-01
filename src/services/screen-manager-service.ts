import { GameFrame } from "../models/game-frame.js";
import { GameScreen } from "../screens/interfaces/game-screen.js";
import { GameLoopService } from "./game-loop-service.js";

export class ScreenManagerService {
  private gameFrame: GameFrame;
  private elapsedTransitionMilliseconds: number = 0;

  // Transition state flags
  private isFadingOutAndIn: boolean = false;
  private isCrossfading: boolean = false;

  // Duration properties in milliseconds
  private fadeInDurationMilliseconds: number = 0;
  private fadeOutDurationMilliseconds: number = 0;
  private crossfadeDurationMilliseconds: number = 0;

  constructor(private gameLoop: GameLoopService) {
    this.gameFrame = gameLoop.getGameFrame();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.isFadingOutAndIn) {
      this.handleFadingOutAndIn(deltaTimeStamp);
    } else if (this.isCrossfading) {
      this.handleCrossfading(deltaTimeStamp);
    }
  }

  public isTransitionActive(): boolean {
    return this.isFadingOutAndIn || this.isCrossfading;
  }

  public fadeOutAndIn(
    nextScreen: GameScreen,
    fadeOutDurationSeconds: number,
    fadeInDurationSeconds: number,
  ): void {
    console.log("Fading out and in to", nextScreen.constructor.name);

    // Check if there is an active transition
    if (this.isTransitionActive()) {
      this.resetTransitionState();
    }

    this.fadeOutDurationMilliseconds = fadeOutDurationSeconds * 1000;
    this.fadeInDurationMilliseconds = fadeInDurationSeconds * 1000;
    this.isFadingOutAndIn = true;
    this.gameFrame.setNextScreen(nextScreen);
  }

  public crossfade(
    nextScreen: GameScreen,
    crossfadeDurationSeconds: number,
  ): void {
    console.log("Crossfading to", nextScreen.constructor.name);

    // Check if there is an active transition
    if (this.isTransitionActive()) {
      this.resetTransitionState();
    }

    this.crossfadeDurationMilliseconds = crossfadeDurationSeconds * 1000;
    this.isCrossfading = true;
    this.gameFrame.setNextScreen(nextScreen);
  }

  private handleFadingOutAndIn(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.elapsedTransitionMilliseconds += deltaTimeStamp;

    this.fadeOutCurrentScreen();
    this.fadeInNextScreen();
  }

  private fadeOutCurrentScreen(): void {
    const currentScreen = this.gameFrame.getCurrentScreen();

    if (!currentScreen) return;

    const fadeOutProgress = Math.min(
      1,
      this.elapsedTransitionMilliseconds / this.fadeOutDurationMilliseconds,
    );

    currentScreen.setOpacity(1 - fadeOutProgress);

    if (fadeOutProgress === 1) {
      // Fade out complete
      this.elapsedTransitionMilliseconds = 0;
    }
  }

  private fadeInNextScreen(): void {
    const nextScreen = this.gameFrame.getNextScreen();

    if (!nextScreen) return;

    const fadeInProgress = Math.min(
      1,
      this.elapsedTransitionMilliseconds / this.fadeInDurationMilliseconds,
    );

    nextScreen.setOpacity(fadeInProgress);

    if (fadeInProgress === 1) {
      // Fade in complete
      this.updateCurrentAndNextScreen(nextScreen);
      this.isFadingOutAndIn = false;
    }
  }

  private handleCrossfading(deltaTimeStamp: DOMHighResTimeStamp): void {
    const nextScreen = this.gameFrame.getNextScreen();

    if (!nextScreen || !nextScreen.hasLoaded()) return;

    this.elapsedTransitionMilliseconds += deltaTimeStamp;

    const crossfadeProgress = Math.min(
      1,
      this.elapsedTransitionMilliseconds / this.crossfadeDurationMilliseconds,
    );

    nextScreen.setOpacity(crossfadeProgress);

    if (crossfadeProgress === 1) {
      this.updateCurrentAndNextScreen(nextScreen);
      this.isCrossfading = false;
    }
  }

  private resetTransitionState(): void {
    this.isFadingOutAndIn = false;
    this.isCrossfading = false;
    this.elapsedTransitionMilliseconds = 0;

    console.log("Previous transition stopped");
  }

  private updateCurrentAndNextScreen(nextScreen: GameScreen): void {
    console.log("Transition to", nextScreen.constructor.name, "finished");
    this.elapsedTransitionMilliseconds = 0;
    this.gameFrame.setCurrentScreen(nextScreen);
    this.gameFrame.getCurrentScreen()?.hasTransitionFinished();
    this.gameFrame.setNextScreen(null);
  }
}
