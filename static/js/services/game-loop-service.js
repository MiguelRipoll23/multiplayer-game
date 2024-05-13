import { NOTIFICATION_EVENT_NAME } from "../constants/events-contants.js";
import { GameFrame } from "../models/game-frame.js";
import { GameState } from "../models/game-state.js";
import { NotificationObject } from "../objects/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";
import { TransitionService } from "./transition-service.js";
export class GameLoopService {
    canvas;
    context;
    gameState;
    gameFrame;
    transitionService;
    previousTimeStamp = 0;
    deltaTimeStamp = 0;
    isRunning = false;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.gameState = new GameState();
        this.gameFrame = new GameFrame();
        this.transitionService = new TransitionService(this.gameFrame);
        this.previousTimeStamp = performance.now();
        this.setCanvasSize();
        this.addEventListeners();
        this.loadNotificationObject();
    }
    getCanvas() {
        return this.canvas;
    }
    getGameState() {
        return this.gameState;
    }
    getGameFrame() {
        return this.gameFrame;
    }
    getTransitionService() {
        return this.transitionService;
    }
    start() {
        this.isRunning = true;
        this.setInitialScreen();
        requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
        this.isRunning = false;
    }
    setCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    addEventListeners() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
        window.addEventListener(NOTIFICATION_EVENT_NAME, (event) => {
            this.gameFrame.getNotificationObject()?.show(event.detail.text);
        });
    }
    loadNotificationObject() {
        const notificationObject = new NotificationObject(this.canvas);
        this.gameFrame.setNotificationObject(notificationObject);
    }
    setInitialScreen() {
        const mainScreen = new MainScreen(this);
        mainScreen.loadObjects();
        this.transitionService.crossfade(mainScreen, 1);
    }
    loop(timeStamp) {
        this.deltaTimeStamp = Math.min(timeStamp - this.previousTimeStamp, 100);
        this.previousTimeStamp = timeStamp;
        this.update(this.deltaTimeStamp);
        this.render();
        if (this.isRunning) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    update(deltaTimeStamp) {
        this.transitionService.update(deltaTimeStamp);
        this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
        this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
        this.gameFrame.getNotificationObject()?.update(deltaTimeStamp);
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameFrame.getCurrentScreen()?.render(this.context);
        this.gameFrame.getNextScreen()?.render(this.context);
        this.gameFrame.getNotificationObject()?.render(this.context);
    }
}
