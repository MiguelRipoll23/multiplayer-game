import { BaseGameObject } from "./base/base-game-object.js";
export class ProgressBarObject extends BaseGameObject {
    canvas;
    progress = 0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    update(deltaTimeStamp) { }
    render(context) {
        // Draw a wide rectangle vertically centered on the screen
        // at the bottom
        // Text at the top of the rectangle (with some padding)
        // bottom border that will be the progress bar
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 10;
        const progressBarHeight = 20;
        const progressBarWidth = width - padding * 2;
        const progressBarX = padding;
        const progressBarY = height - padding - progressBarHeight;
        context.fillStyle = "white";
        context.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    }
}
