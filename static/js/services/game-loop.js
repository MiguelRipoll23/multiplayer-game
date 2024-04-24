import { GameFrame } from "../entities/game-frame.js";
import { WorldScreen } from "../entities/screens/world-screen.js";
import { ScreenManager } from "./screen-manager.js";
export class GameLoop {
    isRunning = false;
    canvas;
    context;
    gameFrame;
    sceneManager;
    previousTimeStamp = 0;
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.gameFrame = new GameFrame();
        this.sceneManager = new ScreenManager(this);
        this.previousTimeStamp = performance.now();
        this.setCanvasSize();
        this.addResizeEventListener();
    }
    getGameFrame() {
        return this.gameFrame;
    }
    start() {
        this.isRunning = true;
        this.setInitialScreen();
        requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
        this.isRunning = false;
    }
    setCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    addResizeEventListener() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    setInitialScreen() {
        const worldScreen = new WorldScreen(this.canvas);
        worldScreen.addObjects();
        this.sceneManager.crossfade(worldScreen, 0.001);
    }
    loop(timeStamp) {
        // Calculate delta time
        const deltaTimeStamp = timeStamp - this.previousTimeStamp;
        this.previousTimeStamp = timeStamp;
        this.update(deltaTimeStamp);
        this.render();
        if (this.isRunning) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    update(deltaTimeStamp) {
        this.sceneManager.update(deltaTimeStamp);
        this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
        this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameFrame.getNextScreen()?.render(this.context);
        this.gameFrame.getCurrentScreen()?.render(this.context);
    }
}
