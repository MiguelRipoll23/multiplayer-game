import { GameFrame } from "../entities/game-frame.js";
import { LocalCar } from "../entities/objects/local-car.js";
import { Joystick } from "../entities/objects/joystick.js";
import { GearStick } from "../entities/objects/gear-stick.js";
import { Target } from "../entities/objects/target.js";
export class GameLoop {
    isRunning = false;
    canvas;
    context;
    oldTimeStamp = 0;
    gameState;
    // test only
    target = null;
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
        const joystick = new Joystick(this.canvas);
        const localCar = new LocalCar((this.canvas.width / 2) - 25, (this.canvas.height / 2) - 25, 90, this.canvas);
        localCar.setControls(joystick, gearStick);
        this.gameState.objects.ui.push(gearStick);
        this.gameState.objects.ui.push(joystick);
        this.gameState.objects.scene.push(localCar);
        // test only
        this.testTarget();
        setInterval(() => {
            this.testTarget();
        }, 5_000);
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
    testTarget() {
        if (this.target) {
            const index = this.gameState.objects.scene.indexOf(this.target);
            if (index !== -1) {
                this.gameState.objects.scene.splice(index, 1);
            }
        }
        this.target = new Target(this.canvas);
        this.gameState.objects.scene.push(this.target);
    }
}
