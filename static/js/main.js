import { GameLoopService } from "./services/game-loop-service.js";
const canvas = document.querySelector("#canvas");
const gameLoop = new GameLoopService(canvas);
gameLoop.start();
