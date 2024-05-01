export class ScreenManagerService {
    gameFrame;
    elapsedTransitionMilliseconds = 0;
    // Transition state flags
    isFadingOutAndIn = false;
    isCrossfading = false;
    // Duration properties in milliseconds
    fadeInDurationMilliseconds = 0;
    fadeOutDurationMilliseconds = 0;
    crossfadeDurationMilliseconds = 0;
    constructor(gameLoop) {
        this.gameFrame = gameLoop.getGameFrame();
    }
    update(deltaTimeStamp) {
        if (this.isFadingOutAndIn) {
            this.handleFadingOutAndIn(deltaTimeStamp);
        }
        else if (this.isCrossfading) {
            this.handleCrossfading(deltaTimeStamp);
        }
    }
    isTransitionActive() {
        return this.isFadingOutAndIn || this.isCrossfading;
    }
    fadeOutAndIn(nextScreen, fadeOutDurationSeconds, fadeInDurationSeconds) {
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
    crossfade(nextScreen, crossfadeDurationSeconds) {
        console.log("Crossfading to", nextScreen.constructor.name);
        // Check if there is an active transition
        if (this.isTransitionActive()) {
            this.resetTransitionState();
        }
        this.crossfadeDurationMilliseconds = crossfadeDurationSeconds * 1000;
        this.isCrossfading = true;
        this.gameFrame.setNextScreen(nextScreen);
    }
    handleFadingOutAndIn(deltaTimeStamp) {
        this.elapsedTransitionMilliseconds += deltaTimeStamp;
        const currentScreen = this.gameFrame.getCurrentScreen();
        const nextScreen = this.gameFrame.getNextScreen();
        if (!currentScreen || !nextScreen)
            return;
        if (currentScreen?.getOpacity() > 0) {
            this.fadeOutCurrentScreen(currentScreen);
        }
        else {
            this.fadeInNextScreen(nextScreen);
        }
    }
    fadeOutCurrentScreen(currentScreen) {
        const fadeOutProgress = Math.min(1, this.elapsedTransitionMilliseconds / this.fadeOutDurationMilliseconds);
        if (fadeOutProgress === 1) {
            // Fade out complete
            this.elapsedTransitionMilliseconds = 0;
        }
        currentScreen.setOpacity(1 - fadeOutProgress);
    }
    fadeInNextScreen(nextScreen) {
        const fadeInProgress = Math.min(1, this.elapsedTransitionMilliseconds / this.fadeInDurationMilliseconds);
        nextScreen.setOpacity(fadeInProgress);
        if (fadeInProgress === 1) {
            // Fade in complete
            this.updateCurrentAndNextScreen(nextScreen);
            this.isFadingOutAndIn = false;
        }
    }
    handleCrossfading(deltaTimeStamp) {
        const nextScreen = this.gameFrame.getNextScreen();
        if (!nextScreen || !nextScreen.hasLoaded())
            return;
        this.elapsedTransitionMilliseconds += deltaTimeStamp;
        const crossfadeProgress = Math.min(1, this.elapsedTransitionMilliseconds / this.crossfadeDurationMilliseconds);
        nextScreen.setOpacity(crossfadeProgress);
        if (crossfadeProgress === 1) {
            this.updateCurrentAndNextScreen(nextScreen);
            this.isCrossfading = false;
        }
    }
    resetTransitionState() {
        this.isFadingOutAndIn = false;
        this.isCrossfading = false;
        this.elapsedTransitionMilliseconds = 0;
        console.log("Previous transition stopped");
    }
    updateCurrentAndNextScreen(nextScreen) {
        this.elapsedTransitionMilliseconds = 0;
        this.gameFrame.setCurrentScreen(nextScreen);
        this.gameFrame.getCurrentScreen()?.hasTransitionFinished();
        this.gameFrame.setNextScreen(null);
    }
}
