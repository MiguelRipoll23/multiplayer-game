import { NOTIFICATION_EVENT_NAME } from "../constants/events-contants.js";
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
    transitionService;
    isRunning = false;
    previousTimeStamp = 0;
    deltaTimeStamp = 0;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        if (this.debug) {
            console.info("%cDebug mode on", "color: #b6ff35; font-size: 20px; font-weight: bold");
        }
        this.setModels();
        this.setServices();
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
    setModels() {
        this.gameController = new GameController(this.canvas, this.debug);
        this.gameFrame = this.gameController.getGameFrame();
        this.gamePointer = this.gameController.getGamePointer();
    }
    setServices() {
        this.transitionService = this.gameController.getTransitionService();
    }
    setCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    addEventListeners() {
        this.addWindowEventListeners();
        this.addTouchEventListeners();
        this.addMouseEventListeners();
        this.addCustomEventListeners();
    }
    addWindowEventListeners() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    addTouchEventListeners() {
        window.addEventListener("touchstart", (event) => {
            this.gamePointer.setX(event.touches[0].clientX);
            this.gamePointer.setY(event.touches[0].clientY);
            this.gamePointer.setPressed(true);
        });
        window.addEventListener("touchend", (event) => {
            this.gamePointer.setX(event.touches[0].clientX);
            this.gamePointer.setY(event.touches[0].clientY);
            this.gamePointer.setPressed(false);
        });
    }
    addMouseEventListeners() {
        window.addEventListener("mousedown", (event) => {
            this.gamePointer.setX(event.clientX);
            this.gamePointer.setY(event.clientY);
            this.gamePointer.setPressed(true);
        });
        window.addEventListener("mouseup", (event) => {
            this.gamePointer.setX(event.clientX);
            this.gamePointer.setY(event.clientY);
            this.gamePointer.setPressed(false);
        });
    }
    addCustomEventListeners() {
        window.addEventListener(NOTIFICATION_EVENT_NAME, (event) => {
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
