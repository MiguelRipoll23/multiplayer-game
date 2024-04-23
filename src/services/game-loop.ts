import { GameFrame } from "../entities/game-frame.js";
import { LocalCar } from "../entities/objects/local-car.js";
import { Joystick } from "../entities/objects/joystick.js";
import { GameObject } from "../interfaces/game-object.js";
import { GearStick } from "../entities/objects/gear-stick.js";

export class GameLoop {
  private isRunning: boolean = false;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private oldTimeStamp: number = 0;

  private gameState: GameFrame;

  constructor() {
    this.gameState = new GameFrame();
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.oldTimeStamp = performance.now();

    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  public getGameState(): GameFrame {
    return this.gameState;
  }

  public start(): void {
    this.isRunning = true;
    this.addResizeEventListener();

    requestAnimationFrame(this.loop.bind(this));

    const gearStick = new GearStick(this.canvas);
    const joystick = new Joystick(this.canvas, this.context);

    const localCar = new LocalCar(
      (this.canvas.width / 2) - 25,
      (this.canvas.height / 2) - 25,
      90,
      this.canvas,
    );

    localCar.setControls(joystick, gearStick);

    this.gameState.objects.ui.push(gearStick);
    this.gameState.objects.ui.push(joystick);
    this.gameState.objects.scene.push(localCar);
  }

  public stop(): void {
    this.isRunning = false;
  }

  private addResizeEventListener(): void {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    });
  }

  private loop(timeStamp: number): void {
    // Calculate delta time
    const deltaTimeStamp = timeStamp - this.oldTimeStamp;
    this.oldTimeStamp = timeStamp;

    this.update(deltaTimeStamp);
    this.render();

    if (this.isRunning) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  private update(deltaTimeStamp: number): void {
    this.gameState.objects.scene.forEach((object: GameObject) =>
      object.update(deltaTimeStamp)
    );

    this.gameState.objects.ui.forEach((object: GameObject) =>
      object.update(deltaTimeStamp)
    );
  }

  private render(): void {
    // Clear the entire canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.gameState.objects.scene.forEach((object: GameObject) =>
      object.render(this.context)
    );

    this.gameState.objects.ui.forEach((object: GameObject) =>
      object.render(this.context)
    );
  }
}
