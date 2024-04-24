export class GameFrame {
    currentScreen = null;
    nextScreen = null;
    getCurrentScreen() {
        return this.currentScreen;
    }
    getNextScreen() {
        return this.nextScreen;
    }
    setCurrentScreen(screen) {
        this.currentScreen = screen;
    }
    setNextScreen(screen) {
        this.nextScreen = screen;
    }
}
