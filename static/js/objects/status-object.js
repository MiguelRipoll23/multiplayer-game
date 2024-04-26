import { BaseGameObject } from "./base/base-game-object.js";
export class StatusObject extends BaseGameObject {
    canvas;
    DISTANCE_CENTER = 350;
    FILL_COLOR = "rgba(0, 0, 0, 0.5)";
    TEXT_PADDING = 140;
    DEFAULT_HEIGHT = 40;
    x = 0;
    y = 0;
    width = 0;
    height = this.DEFAULT_HEIGHT;
    active = false;
    text = "Unknown";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setPosition();
    }
    setPosition() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2 + this.DISTANCE_CENTER;
    }
    update(_deltaTimeStamp) {
        // No need to check if active here
    }
    render(context) {
        if (!this.active)
            return;
        // Calculate width based on text length
        this.width = context.measureText(this.text).width - this.TEXT_PADDING; // Add padding
        // Draw rounded rectangle
        context.fillStyle = this.FILL_COLOR; // Use fill color constant
        this.roundRect(context, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 10);
        // Draw text
        context.font = "16px Arial";
        context.fillStyle = "WHITE";
        context.textAlign = "center";
        context.fillText(this.text, this.x, this.y + 5); // Adjust y position for better centering
    }
    // Setter for the active property
    setActive(value) {
        this.active = value;
    }
    // Setter for the text property
    setText(value) {
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
