import { SERVER_NOTIFICATION_EVENT } from "../constants/events-contants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { GamePointer } from "../models/game-pointer.js";
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
      "color: #b6ff35; font-size: 20px; font-weight: bold",
    );
  }

  private setCanvasSize(): void {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  private addEventListeners(): void {
    this.addWindowEventListeners();
    this.addTouchEventListeners();
    this.addMouseEventListeners();
    this.addCustomEventListeners();
  }

  private addWindowEventListeners(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });
  }

  private addTouchEventListeners(): void {
    window.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (!touch) return;

      this.updateGamePointerWithTouch(touch, true);
    });

    window.addEventListener("touchend", (event) => {
      const touch = event.touches[0];
      if (!touch) return;

      this.updateGamePointerWithTouch(touch, false);
    });
  }

  private updateGamePointerWithTouch(touch: Touch, pressed: boolean): void {
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    this.gamePointer.setX(touchX);
    this.gamePointer.setY(touchY);
    this.gamePointer.setPressed(pressed);
  }

  private addMouseEventListeners(): void {
    window.addEventListener("mousedown", (event) => {
      this.updateGamePointerWithMouse(event, true);
    });

    window.addEventListener("mouseup", (event) => {
      this.updateGamePointerWithMouse(event, false);
    });
  }

  private updateGamePointerWithMouse(
    event: MouseEvent,
    pressed: boolean,
  ): void {
    this.gamePointer.setX(event.clientX);
    this.gamePointer.setY(event.clientY);
    this.gamePointer.setPressed(pressed);
  }

  private addCustomEventListeners(): void {
    window.addEventListener(SERVER_NOTIFICATION_EVENT, (event) => {
      console.log(`Event ${SERVER_NOTIFICATION_EVENT} handled`, event);
      this.gameFrame.getNotificationObject()?.show(
        (event as CustomEvent<any>).detail.text,
      );
    });
  }

  private loadNotificationObject(): void {
    const notificationObject = new NotificationObject(this.canvas);

    this.gameFrame.setNotificationObject(
      notificationObject,
    );
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
