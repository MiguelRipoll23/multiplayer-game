import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { GamePointer } from "../models/game-pointer.js";
import { NotificationObject } from "../objects/common/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";
import { GameKeyboard } from "../models/game-keyboard.js";
import { LoginScreen } from "../screens/main-screen/login-screen.js";
import { MainMenuScreen } from "../screens/main-screen/main-menu-screen.js";
import { EventType } from "../enums/event-type.js";
import { ServerDisconnectedPayload } from "./interfaces/events/server-disconnected-payload.js";
import { ServerNotificationPayload } from "./interfaces/events/server-notification-payload.js";

export class GameLoopService {
  private context: CanvasRenderingContext2D;
  private debug: boolean = false;

  private gameController: GameController;
  private gameFrame: GameFrame;
  private gamePointer: GamePointer;
  private gameKeyboard: GameKeyboard;

  private isRunning: boolean = false;
  private previousTimeStamp: DOMHighResTimeStamp = 0;
  private deltaTimeStamp: DOMHighResTimeStamp = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.logDebugInfo();
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.gameController = new GameController(this.canvas, this.debug);
    this.gameFrame = this.gameController.getGameFrame();
    this.gamePointer = this.gameController.getGamePointer();
    this.gameKeyboard = this.gameController.getGameKeyboard();

    this.setCanvasSize();
    this.addEventListeners();
    this.loadNotificationObject();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getGameController(): GameController {
    return this.gameController;
  }

  public start(): void {
    this.isRunning = true;
    this.previousTimeStamp = performance.now();
    this.setInitialScreen();

    requestAnimationFrame(this.loop.bind(this));
  }

  public stop(): void {
    this.isRunning = false;
  }

  private logDebugInfo(): void {
    if (this.debug === false) return;

    console.info(
      "%cDebug mode on",
      "color: #b6ff35; font-size: 20px; font-weight: bold"
    );
  }

  private setCanvasSize(): void {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  private addEventListeners(): void {
    this.addWindowEventListeners();
    this.gamePointer.addEventListeners();
    this.gameKeyboard.addEventListeners();
  }

  private addWindowEventListeners(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });
  }

  private handleServerDisconnectedEvent(
    payload: ServerDisconnectedPayload
  ): void {
    if (payload.connectionLost) {
      alert("Connection to server was lost");
    } else {
      alert("Failed to connect to server");
    }

    window.location.reload();
  }

  private handleServerNotificationEvent(
    payload: ServerNotificationPayload
  ): void {
    this.gameFrame.getNotificationObject()?.show(payload.message);
  }

  private handleHostDisconnectedEvent(): void {
    alert("Host has disconnected");

    const mainScreen = new MainScreen(this.getGameController());
    const mainMenuScreen = new MainMenuScreen(this.getGameController(), false);

    mainScreen.setScreen(mainMenuScreen);
    mainScreen.loadObjects();

    this.getGameController()
      .getTransitionService()
      .fadeOutAndIn(mainScreen, 1, 1);
  }

  private loadNotificationObject(): void {
    const notificationObject = new NotificationObject(this.canvas);

    this.gameFrame.setNotificationObject(notificationObject);
  }

  private setInitialScreen() {
    const mainScreen = new MainScreen(this.gameController);
    const loginScreen = new LoginScreen(this.gameController);

    mainScreen.setScreen(loginScreen);
    mainScreen.loadObjects();

    this.gameController.getTransitionService().crossfade(mainScreen, 1);
  }

  private loop(timeStamp: DOMHighResTimeStamp): void {
    this.deltaTimeStamp = Math.min(timeStamp - this.previousTimeStamp, 100);
    this.previousTimeStamp = timeStamp;

    this.update(this.deltaTimeStamp);
    this.render();

    if (this.isRunning) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  private update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.listenForEvents();

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

  private render(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.gameFrame.getCurrentScreen()?.render(this.context);
    this.gameFrame.getNextScreen()?.render(this.context);
    this.gameFrame.getNotificationObject()?.render(this.context);
  }

  private listenForEvents(): void {
    this.gameController
      .getEventProcessorService()
      .listenLocalEvent(
        EventType.ServerDisconnected,
        this.handleServerDisconnectedEvent.bind(this)
      );

    this.gameController
      .getEventProcessorService()
      .listenLocalEvent(
        EventType.HostDisconnected,
        this.handleHostDisconnectedEvent.bind(this)
      );

    this.gameController
      .getEventProcessorService()
      .listenLocalEvent(
        EventType.ServerNotification,
        this.handleServerNotificationEvent.bind(this)
      );
  }
}
