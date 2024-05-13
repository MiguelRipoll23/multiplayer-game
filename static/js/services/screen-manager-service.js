import { TransitionService } from "./transition-service.js";
export class ScreenManagerService {
    stack = [];
    currentScreen = null;
    nextScreen = null;
    transitionService;
    constructor() {
        this.transitionService = new TransitionService(this);
    }
    getTransitionService() {
        return this.transitionService;
    }
    getPreviousScreen() {
        if (this.currentScreen === null) {
            return null;
        }
        const index = this.stack.indexOf(this.currentScreen) - 1;
        return this.stack[index - 1] || null;
    }
    getCurrentScreen() {
        return this.currentScreen;
    }
    getNextScreen() {
        return this.nextScreen;
    }
    setCurrentScreen(currentScreen) {
        this.currentScreen = currentScreen;
    }
    setNextScreen(nextScreen) {
        if (nextScreen !== null) {
            this.stack.push(nextScreen);
        }
        this.nextScreen = nextScreen;
    }
    update(deltaTimeStamp) {
        this.transitionService.update(deltaTimeStamp);
        this.currentScreen?.update(deltaTimeStamp);
        this.nextScreen?.update(deltaTimeStamp);
    }
    render(context) {
        this.currentScreen?.render(context);
        this.nextScreen?.render(context);
    }
}
