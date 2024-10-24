import { BaseAnimatedGameObject } from "../base/base-animated-object.js";
export class BackdropObject extends BaseAnimatedGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    render(context) {
        context.fillStyle = this.FILL_COLOR;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
