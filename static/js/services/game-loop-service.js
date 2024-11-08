import { HOST_DISCONNECTED_EVENT, SERVER_DISCONNECTED_EVENT, SERVER_NOTIFICATION_EVENT, } from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { NotificationObject } from "../objects/common/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";
import { LoginScreen } from "../screens/main-screen/login-screen.js";
import { MainMenuScreen } from "../screens/main-screen/main-menu-screen.js";
export class GameLoopService {
    canvas;
    context;
    debug = true;
    gameController;
    gameFrame;
    gamePointer;
    gameKeyboard;
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
        this.gameKeyboard = this.gameController.getGameKeyboard();
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
        this.addCustomEventListeners();
        this.gamePointer.addEventListeners();
        this.gameKeyboard.addEventListeners();
    }
    addWindowEventListeners() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    addCustomEventListeners() {
        window.addEventListener(SERVER_DISCONNECTED_EVENT, (event) => {
            this.handleServerDisconnectedEvent(event);
        });
        window.addEventListener(SERVER_NOTIFICATION_EVENT, (event) => {
            this.handleServerNotificationEvent(event);
        });
        window.addEventListener(HOST_DISCONNECTED_EVENT, () => {
            this.handleHostDisconnectedEvent();
        });
    }
    handleServerDisconnectedEvent(event) {
        console.log(`Event ${SERVER_DISCONNECTED_EVENT} handled`, event);
        if (event.detail.connectionLost) {
            alert("Connection to server was lost");
        }
        else {
            alert("Failed to connect to server");
        }
        window.location.reload();
    }
    handleServerNotificationEvent(event) {
        console.log(`Event ${SERVER_NOTIFICATION_EVENT} handled`, event);
        this.gameFrame.getNotificationObject()?.show(event.detail.text);
    }
    handleHostDisconnectedEvent() {
        console.log(`Event ${HOST_DISCONNECTED_EVENT} handled`);
        alert("Host has disconnected");
        const mainScreen = new MainScreen(this.getGameController());
        const mainMenuScreen = new MainMenuScreen(this.getGameController(), false);
        mainScreen.setScreen(mainMenuScreen);
        mainScreen.loadObjects();
        this.getGameController()
            .getTransitionService()
            .fadeOutAndIn(mainScreen, 1, 1);
    }
    loadNotificationObject() {
        const notificationObject = new NotificationObject(this.canvas);
        this.gameFrame.setNotificationObject(notificationObject);
    }
    setInitialScreen() {
        const mainScreen = new MainScreen(this.gameController);
        const loginScreen = new LoginScreen(this.gameController);
        mainScreen.setScreen(loginScreen);
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
        this.gameController
            .getTimers()
            .forEach((timer) => timer.update(deltaTimeStamp));
        this.gameController.getTransitionService().update(deltaTimeStamp);
        this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
        this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
        this.gameFrame.getNotificationObject()?.update(deltaTimeStamp);
        this.gameController
            .getTimers()
            .filter((timer) => timer.hasCompleted())
            .forEach((timer) => this.gameController.removeTimer(timer));
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameFrame.getCurrentScreen()?.render(this.context);
        this.gameFrame.getNextScreen()?.render(this.context);
        this.gameFrame.getNotificationObject()?.render(this.context);
    }
}
