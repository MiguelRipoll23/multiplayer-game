import { GameFrame } from "../entities/game-frame.js";
import { LocalCar } from "../entities/objects/local-car.js";
import { Joystick } from "../entities/objects/joystick.js";
import { GearStick } from "../entities/objects/gear-stick.js";
export class GameLoop {
    isRunning = false;
    canvas;
    context;
    oldTimeStamp = 0;
    gameState;
    constructor() {
        this.gameState = new GameFrame();
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.oldTimeStamp = performance.now();
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    getGameState() {
        return this.gameState;
    }
    start() {
        this.isRunning = true;
        this.addResizeEventListener();
        requestAnimationFrame(this.loop.bind(this));
        const gearStick = new GearStick(this.canvas);
        const joystick = new Joystick(this.canvas, this.context);
        const localCar = new LocalCar((this.canvas.width / 2) - 25, (this.canvas.height / 2) - 25, 90, this.canvas);
        localCar.setControls(joystick, gearStick);
        this.gameState.objects.ui.push(gearStick);
        this.gameState.objects.ui.push(joystick);
        this.gameState.objects.scene.push(localCar);
    }
    stop() {
        this.isRunning = false;
    }
    addResizeEventListener() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    loop(timeStamp) {
        // Calculate delta time
        const deltaTimeStamp = timeStamp - this.oldTimeStamp;
        this.oldTimeStamp = timeStamp;
        this.update(deltaTimeStamp);
        this.render();
        if (this.isRunning) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    update(deltaTimeStamp) {
        this.gameState.objects.scene.forEach((object) => object.update(deltaTimeStamp));
        this.gameState.objects.ui.forEach((object) => object.update(deltaTimeStamp));
    }
    render() {
        // Clear the entire canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameState.objects.scene.forEach((object) => object.render(this.context));
        this.gameState.objects.ui.forEach((object) => object.render(this.context));
    }
}
