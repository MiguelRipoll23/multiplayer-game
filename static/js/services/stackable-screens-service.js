import { TransitionService } from "./transition-service.js";
export class StackableScreensService {
    screens = [];
    transitionService;
    constructor() {
        this.transitionService = new TransitionService();
    }
    fadeOutAndIn(screen) {
        screen.setScreenManager(this);
        this.screens.push(screen);
        this.transitionService.fadeOutAndIn(screen, 1, 1);
    }
    removeLastScreen() {
        this.screens.pop();
    }
    getCurrentScreen() {
        const activeScreens = this.screens.filter((screen) => screen.isActive());
        if (activeScreens.length === 0) {
            return null;
        }
        return activeScreens[0];
    }
    getNextScreen() {
        return this.screens.at(-1) || null;
    }
}
