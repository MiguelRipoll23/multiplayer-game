export class GameFrame {
    currentScreen = null;
    nextScreen = null;
    notificationObject = null;
    getCurrentScreen() {
        return this.currentScreen;
    }
    getNextScreen() {
        return this.nextScreen;
    }
    getNotificationObject() {
        return this.notificationObject;
    }
    setCurrentScreen(screen) {
        this.currentScreen = screen;
    }
    setNextScreen(screen) {
        this.nextScreen = screen;
    }
    setNotificationObject(object) {
        this.notificationObject = object;
    }
}
