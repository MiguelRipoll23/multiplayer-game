import { BaseGameObject } from "./base/base-game-object.js";
export class DialogObject extends BaseGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    x = 0;
    y = 0;
    textX = 0;
    textY = 0;
    width = this.DEFAULT_WIDTH;
    height = this.DEFAULT_HEIGHT;
    active = false;
    text = "Unknown";
    elapsedMilliseconds = 0;
    opacity = 0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setPosition();
    }
    setPosition() {
        this.x = this.canvas.width / 2 - (this.width / 2);
        this.y = this.canvas.height / 2 - (this.height / 2);
        this.textX = this.x + this.width / 2;
        this.textY = this.y + this.height / 2 + 5;
    }
    update(deltaTimeStamp) {
        if (!this.active)
            return;
        if (this.opacity < 1) {
            this.elapsedMilliseconds += deltaTimeStamp;
            if (this.elapsedMilliseconds < 150) {
                this.opacity = this.elapsedMilliseconds / 150;
            }
            else {
                this.opacity = 1;
            }
        }
    }
    render(context) {
        if (!this.active)
            return;
        context.globalAlpha = this.opacity;
        // Draw rounded rectangle
        context.fillStyle = this.FILL_COLOR; // Use fill color constant
        this.roundRect(context, this.x, this.y, this.width, this.height, 6);
        // Draw text
        context.font = "16px Arial";
        context.fillStyle = "WHITE";
        context.textAlign = "center";
        context.fillText(this.text, this.textX, this.textY);
        context.globalAlpha = this.opacity;
    }
    // Setter for the active property
    setActive(value) {
        this.active = value;
    }
    // Setter for the text property
    setText(value) {
        this.elapsedMilliseconds = 0;
        this.text = value;
    }
    // Function to draw rounded rectangle
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
    }
}
