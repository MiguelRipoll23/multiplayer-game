import { BrowserService } from "./services/browser-service.js";
import { GameLoopService } from "./services/game-loop-service.js";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
new BrowserService(canvas);

const gameLoop = new GameLoopService(canvas);
gameLoop.start();
