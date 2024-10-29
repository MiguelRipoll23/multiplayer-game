export class ScreenTransitionService {
    screenManager;
    elapsedTransitionMilliseconds = 0;
    // Transition state flags
    isFadingOutAndIn = false;
    isCrossfading = false;
    // Duration properties in milliseconds
    fadeInDurationMilliseconds = 0;
    fadeOutDurationMilliseconds = 0;
    crossfadeDurationMilliseconds = 0;
    constructor(screenManager) {
        this.screenManager = screenManager;
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
        if (this.isNextScreenAlreadySet(nextScreen)) {
            console.warn("Ignoring duplicated transition to the same screen");
            return;
        }
        console.log("Fading out and in to", nextScreen.constructor.name);
        // Check if there is an active transition
        if (this.isTransitionActive()) {
            this.resetTransitionState();
        }
        this.screenManager.setNextScreen(nextScreen);
        this.fadeOutDurationMilliseconds = fadeOutDurationSeconds * 1000;
        this.fadeInDurationMilliseconds = fadeInDurationSeconds * 1000;
        this.isFadingOutAndIn = true;
    }
    crossfade(nextScreen, crossfadeDurationSeconds) {
        if (this.isNextScreenAlreadySet(nextScreen)) {
            console.warn("Ignoring duplicated transition to the same screen");
            return;
        }
        console.log("Crossfading to", nextScreen.constructor.name);
        // Check if there is an active transition
        if (this.isTransitionActive()) {
            this.resetTransitionState();
        }
        this.screenManager.setNextScreen(nextScreen);
        this.crossfadeDurationMilliseconds = crossfadeDurationSeconds * 1000;
        this.isCrossfading = true;
    }
    isNextScreenAlreadySet(nextScreen) {
        const currentNextScreen = this.screenManager.getNextScreen();
        return currentNextScreen?.constructor === nextScreen.constructor;
    }
    handleFadingOutAndIn(deltaTimeStamp) {
        this.elapsedTransitionMilliseconds += deltaTimeStamp;
        const currentScreen = this.screenManager.getCurrentScreen();
        const nextScreen = this.screenManager.getNextScreen();
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
        const fadeOutOpacity = Math.min(1, this.elapsedTransitionMilliseconds / this.fadeOutDurationMilliseconds);
        if (fadeOutOpacity === 1) {
            // Fade out complete
            this.elapsedTransitionMilliseconds = 0;
        }
        currentScreen.setOpacity(1 - fadeOutOpacity);
    }
    fadeInNextScreen(nextScreen) {
        const fadeInOpacity = Math.min(1, this.elapsedTransitionMilliseconds / this.fadeInDurationMilliseconds);
        nextScreen.setOpacity(fadeInOpacity);
        if (fadeInOpacity === 1) {
            this.updateCurrentAndNextScreen(nextScreen);
        }
    }
    handleCrossfading(deltaTimeStamp) {
        const nextScreen = this.screenManager.getNextScreen();
        if (!nextScreen || !nextScreen.hasLoaded())
            return;
        this.elapsedTransitionMilliseconds += deltaTimeStamp;
        const crossfadeOpacity = Math.min(1, this.elapsedTransitionMilliseconds / this.crossfadeDurationMilliseconds);
        nextScreen.setOpacity(crossfadeOpacity);
        if (crossfadeOpacity === 1) {
            this.updateCurrentAndNextScreen(nextScreen);
        }
    }
    resetTransitionState() {
        this.isFadingOutAndIn = false;
        this.isCrossfading = false;
        this.elapsedTransitionMilliseconds = 0;
    }
    updateCurrentAndNextScreen(nextScreen) {
        this.resetTransitionState();
        this.screenManager.setCurrentScreen(nextScreen);
        this.screenManager.setNextScreen(null);
        this.screenManager.getCurrentScreen()?.hasTransitionFinished();
    }
}
