import { BaseGameObject } from "../base/base-game-object.js";
export class LoadingBackgroundObject extends BaseGameObject {
    canvas;
    gradientOffset = 0; // Offset for moving gradient
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    // Update the gradient offset to animate the background
    update(deltaTimeStamp) {
        this.gradientOffset += deltaTimeStamp * 0.01; // Adjust speed as needed
        if (this.gradientOffset > this.canvas.width) {
            this.gradientOffset = 0; // Loop the gradient
        }
    }
    render(context) {
        this.drawMovingGradientSky(context);
    }
    drawMovingGradientSky(context) {
        const gradient = context.createLinearGradient(this.gradientOffset, 0, this.canvas.width + this.gradientOffset, this.canvas.height / 2);
        gradient.addColorStop(0, "#000428");
        gradient.addColorStop(1, "#004e92");
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
