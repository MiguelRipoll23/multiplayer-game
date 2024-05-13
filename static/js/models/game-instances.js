import { TransitionService } from "../services/transition-service.js";
import { GameFrame } from "./game-frame.js";
import { GameState } from "./game-state.js";
export class GameController {
    gameState;
    gameFrame;
    transitionService;
    constructor(canvas) {
        this.gameState = new GameState();
        this.gameFrame = new GameFrame();
        this.transitionService = new TransitionService(this.gameFrame);
    }
}
