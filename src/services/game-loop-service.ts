import {
  SERVER_DISCONNECTED_EVENT,
  SERVER_NOTIFICATION_EVENT,
} from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { GamePointer, PointerType } from "../models/game-pointer.js";
import { NotificationObject } from "../objects/common/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";

export class GameLoopService {
  private context: CanvasRenderingContext2D;
  private debug: boolean = true;

  private gameController: GameController;
  private gameFrame: GameFrame;
  private gamePointer: GamePointer;

  private isRunning: boolean = false;
  private previousTimeStamp: DOMHighResTimeStamp = 0;
  private deltaTimeStamp: DOMHighResTimeStamp = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.logDebugInfo();
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.gameController = new GameController(this.canvas, this.debug);
    this.gameFrame = this.gameController.getGameFrame();
    this.gamePointer = this.gameController.getGamePointer();

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
    );ñ
  }

  private setCanvasSize(): void {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  private addEventListeners(): void {
    this.addWindowEventListeners();
    this.addPointerEventListeners();
    this.addCustomEventListeners();
  }

  private addWindowEventListeners(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });
  }

  private addPointerEventListeners(): void {
    window.addEventListener("pointermove", (event) => {
      this.gamePointer.setX(event.clientX);
      this.gamePointer.setY(event.clientY);
    });

    window.addEventListener("pointerdown", (event) => {
      this.gamePointer.setType(event.pointerType as PointerType);
      this.gamePointer.setX(event.clientX);
      this.gamePointer.setY(event.clientY);
      this.gamePointer.setInitialX(event.clientX);
      this.gamePointer.setInitialY(event.clientY);
      this.gamePointer.setPressing(true);
    });

    window.addEventListener("pointerup", (event) => {
      this.gamePointer.setX(event.clientX);
      this.gamePointer.setY(event.clientY);
      this.gamePointer.setPressing(false);
      this.gamePointer.setPressed(true);
    });
  }

  private addCustomEventListeners(): void {
    window.addEventListener(SERVER_DISCONNECTED_EVENT, (event) => {
      this.handleServerDisconnectedEvent(event as CustomEvent<any>);
    });

    window.addEventListener(SERVER_NOTIFICATION_EVENT, (event) => {
      this.handleServerNotificationEvent(event as CustomEvent<any>);
    });
  }

  private handleServerDisconnectedEvent(event: CustomEvent<any>): void {
    console.log(`Event ${SERVER_DISCONNECTED_EVENT} handled`, event);

    if (event.detail.connectionLost) {
      alert("Connection to server was lost");
    } else {
      alert("Failed to connect to server");
    }

    window.location.reload();
  }

  private handleServerNotificationEvent(event: CustomEvent<any>): void {
    console.log(`Event ${SERVER_NOTIFICATION_EVENT} handled`, event);

    this.gameFrame.getNotificationObject()?.show(event.detail.text);
  }

  private loadNotificationObject(): void {
    const notificationObject = new NotificationObject(this.canvas);

    this.gameFrame.setNotificationObject(notificationObject);
  }

  private setInitialScreen() {
    const mainScreen = new MainScreen(this.gameController);
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
    this.gameController.getTransitionService().update(deltaTimeStamp);

    this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
    this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
    this.gameFrame.getNotificationObject()?.update(deltaTimeStamp);
  }

  private render(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.gameFrame.getCurrentScreen()?.render(this.context);
    this.gameFrame.getNextScreen()?.render(this.context);
    this.gameFrame.getNotificationObject()?.render(this.context);
  }
}
