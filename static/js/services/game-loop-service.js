import { SERVER_NOTIFICATION_EVENT } from "../constants/events-contants.js";
import { GameController } from "../models/game-controller.js";
import { NotificationObject } from "../objects/common/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";
export class GameLoopService {
    canvas;
    context;
    debug = true;
    gameController;
    gameFrame;
    gamePointer;
    isRunning = false;
    previousTimeStamp = 0;
    deltaTimeStamp = 0;
    constructor(canvas) {
        this.canvas = canvas;
        this.logDebugInfo();
        this.context = this.canvas.getContext("2d");
        this.gameController = new GameController(this.canvas, this.debug);
        this.gameFrame = this.gameController.getGameFrame();
        this.gamePointer = this.gameController.getGamePointer();
        this.setCanvasSize();
        this.addEventListeners();
        this.loadNotificationObject();
    }
    getCanvas() {
        return this.canvas;
    }
    getGameController() {
        return this.gameController;
    }
    start() {
        this.isRunning = true;
        this.previousTimeStamp = performance.now();
        this.setInitialScreen();
        requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
        this.isRunning = false;
    }
    logDebugInfo() {
        if (this.debug === false)
            return;
        console.info("%cDebug mode on", "color: #b6ff35; font-size: 20px; font-weight: bold");
    }
    setCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    addEventListeners() {
        this.addWindowEventListeners();
        this.addPointerEventListeners();
        this.addCustomEventListeners();
    }
    addWindowEventListeners() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    addPointerEventListeners() {
        window.addEventListener("pointermove", (event) => {
            this.gamePointer.setX(event.clientX);
            this.gamePointer.setY(event.clientY);
        });
        window.addEventListener("pointerdown", (event) => {
            this.gamePointer.setType(event.pointerType);
            this.gamePointer.setX(event.clientX);
            this.gamePointer.setY(event.clientY);
            this.gamePointer.setPressing(true);
        });
        window.addEventListener("pointerup", (event) => {
            this.gamePointer.setX(event.clientX);
            this.gamePointer.setY(event.clientY);
            this.gamePointer.setPressing(false);
            this.gamePointer.setPressed(true);
        });
    }
    addCustomEventListeners() {
        window.addEventListener(SERVER_NOTIFICATION_EVENT, (event) => {
            console.log(`Event ${SERVER_NOTIFICATION_EVENT} handled`, event);
            this.gameFrame.getNotificationObject()?.show(event.detail.text);
        });
    }
    loadNotificationObject() {
        const notificationObject = new NotificationObject(this.canvas);
        this.gameFrame.setNotificationObject(notificationObject);
    }
    setInitialScreen() {
        const mainScreen = new MainScreen(this.gameController);
        mainScreen.loadObjects();
        this.gameController.getTransitionService().crossfade(mainScreen, 1);
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
        this.gameController.getTransitionService().update(deltaTimeStamp);
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
