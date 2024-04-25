import { GameFrame } from "../models/game-frame.js";
import { WorldScreen } from "../screens/world-screen.js";
import { ScreenManagerService } from "./screen-manager-service.js";

export class GameLoopService {
  private isRunning: boolean = false;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private gameFrame: GameFrame;
  private screenManager: ScreenManagerService;

  private previousTimeStamp: DOMHighResTimeStamp = 0;
  private deltaTimeStamp: DOMHighResTimeStamp = 0;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.gameFrame = new GameFrame();
    this.screenManager = new ScreenManagerService(this);

    this.previousTimeStamp = performance.now();

    this.setCanvasSize();
    this.addResizeEventListener();
  }

  public getGameFrame(): GameFrame {
    return this.gameFrame;
  }

  public start(): void {
    this.isRunning = true;
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

  private addResizeEventListener(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });
  }

  private setInitialScreen() {
    const worldScreen = new WorldScreen(this.canvas);
    worldScreen.loadObjects();

    this.screenManager.crossfade(worldScreen, 1);
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
    this.screenManager.update(deltaTimeStamp);
    this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
    this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
  }

  private render(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.gameFrame.getNextScreen()?.render(this.context);
    this.gameFrame.getCurrentScreen()?.render(this.context);
  }
}
