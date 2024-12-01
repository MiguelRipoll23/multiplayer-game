import { GameLoopService } from "./services/game-loop-service.js";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const gameLoop = new GameLoopService(canvas);
gameLoop.start();

window.addEventListener("error", (event) => {
  alert(`Error: ${event.message}`);
});
