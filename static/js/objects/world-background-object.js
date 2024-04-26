import { BaseGameObject } from "./base/base-game-object.js";
export class WorldBackgroundObject extends BaseGameObject {
    canvas;
    BACKGROUND_COLOR = "#00A000";
    LINE_BLUE_COLOR = "#52cee2";
    LINE_RED_COLOR = "#e26652";
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    update(deltaTimeStamp) {
        // No update logic required
    }
    render(context) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        // Draw top half (red)
        context.fillStyle = this.LINE_RED_COLOR;
        context.fillRect(0, 0, canvasWidth, canvasHeight / 2);
        // Draw bottom half (blue)
        context.fillStyle = this.LINE_BLUE_COLOR;
        context.fillRect(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    }
}
