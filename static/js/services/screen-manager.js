export class ScreenManager {
    gameFrame;
    fadeInSpeed = 0;
    fadeOutSpeed = 0;
    crossfadeSpeed = 0;
    isFadingOutAndIn = false;
    isCrossfading = false;
    isTransitioning = this.isFadingOutAndIn || this.isCrossfading;
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
    isTransitioningScreens() {
        return this.isTransitioning;
    }
    fadeOutAndIn(nextScreen, fadeOutSpeed, fadeInSpeed) {
        console.log("Fading out and in to", nextScreen.constructor.name);
        this.isFadingOutAndIn = true;
        this.fadeInSpeed = fadeInSpeed;
        this.fadeOutSpeed = fadeOutSpeed;
        this.gameFrame.setNextScreen(nextScreen);
    }
    crossfade(nextScreen, crossfadeSpeed) {
        console.log("Crossfading to", nextScreen.constructor.name);
        this.isCrossfading = true;
        this.crossfadeSpeed = crossfadeSpeed;
        this.gameFrame.setNextScreen(nextScreen);
    }
    handleFadingOutAndIn(deltaTime) {
        const currentScreen = this.gameFrame.getCurrentScreen();
        const nextScreen = this.gameFrame.getNextScreen();
        if (currentScreen === null || nextScreen === null) {
            return;
        }
        this.fadeOutCurrentScreen(deltaTime, currentScreen);
        // Check if the current screen has faded out
        if (currentScreen.getOpacity() === 0) {
            // Check if the next screen has loaded
            if (nextScreen.hasLoaded()) {
                this.fadeInNextScreen(deltaTime, nextScreen);
            }
        }
        this.updateCurrentAndNextScreen(nextScreen);
        this.isFadingOutAndIn = false;
    }
    fadeOutCurrentScreen(deltaTime, currentScreen) {
        const currentScreenOpacity = currentScreen.getOpacity();
        const targetCurrentOpacity = Math.max(currentScreenOpacity - this.fadeOutSpeed * deltaTime, 0);
        currentScreen.setOpacity(targetCurrentOpacity);
    }
    fadeInNextScreen(deltaTime, nextScreen) {
        const nextScreenOpacity = nextScreen.getOpacity();
        const targetNextScreenOpacity = Math.min(nextScreenOpacity + this.fadeInSpeed * deltaTime, 1);
        nextScreen.setOpacity(targetNextScreenOpacity);
    }
    handleCrossfading(deltaTimeStamp) {
        const nextScreen = this.gameFrame.getNextScreen();
        // No screen, no transition
        if (nextScreen === null) {
            return;
        }
        // Wait until screen has loaded
        if (nextScreen.hasLoaded() === false) {
            return;
        }
        const opacity = nextScreen.getOpacity();
        const targetOpacity = Math.min(opacity + this.crossfadeSpeed * deltaTimeStamp, 1);
        nextScreen.setOpacity(targetOpacity);
        if (targetOpacity === 1) {
            this.updateCurrentAndNextScreen(nextScreen);
            this.isCrossfading = false;
        }
    }
    updateCurrentAndNextScreen(nextScreen) {
        console.log("Transition to", nextScreen.constructor.name, "finished");
        this.gameFrame.setCurrentScreen(nextScreen);
        this.gameFrame.setNextScreen(null);
    }
}
