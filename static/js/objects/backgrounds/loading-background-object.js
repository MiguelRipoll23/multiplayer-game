import { BaseGameObject } from "../base/base-game-object.js";
export class LoadingBackgroundObject extends BaseGameObject {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    render(context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
