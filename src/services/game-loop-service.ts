import { NOTIFICATION_EVENT_NAME } from "../constants/events-contants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { NotificationObject } from "../objects/common/notification-object.js";
import { MainScreen } from "../screens/main-screen.js";
import { TransitionService } from "./transition-service.js";

export class GameLoopService {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private gameController: GameController;
  private gameFrame: GameFrame;
  private transitionService: TransitionService;

  private isRunning: boolean = false;
  private previousTimeStamp: DOMHighResTimeStamp = 0;
  private deltaTimeStamp: DOMHighResTimeStamp = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.gameController = new GameController(this.canvas);
    this.gameFrame = this.gameController.getGameFrame();
    this.transitionService = this.gameController.getTransitionService();

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

  private setCanvasSize(): void {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  private addEventListeners(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });

    window.addEventListener(NOTIFICATION_EVENT_NAME, (event) => {
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
    this.transitionService.update(deltaTimeStamp);

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
