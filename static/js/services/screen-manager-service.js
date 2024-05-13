import { TransitionService } from "./transition-service.js";
export class ScreenManagerService {
    stack = [];
    currentScreen = null;
    nextScreen = null;
    transitionService;
    constructor(screen) {
        this.transitionService = new TransitionService(this);
        this.stack.push(screen);
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
        this.nextScreen = nextScreen;
        this.nextScreen?.setScreenManagerService(this);
        if (nextScreen === null) {
            return;
        }
        this.handleStack(nextScreen);
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
    handleStack(nextScreen) {
        if (this.stack.includes(nextScreen)) {
            // back to previous screen
            this.stack.pop();
        }
        else {
            // new screen
            this.stack.push(nextScreen);
        }
        console.log("Screens stack", this.stack);
    }
}
