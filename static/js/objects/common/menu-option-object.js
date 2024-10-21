import { PressableBaseGameObject } from "../base/pressable-game-object.js";
export class MenuOptionObject extends PressableBaseGameObject {
    index;
    radius = 15;
    textX = 0;
    textY = 0;
    text;
    constructor(canvas, index, text) {
        super(canvas);
        this.index = index;
        this.text = text.toUpperCase();
        this.setSize(canvas);
    }
    getIndex() {
        return this.index;
    }
    getHeight() {
        return this.height;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.calculateTextPosition();
    }
    render(context) {
        // Draw rounded rectangle with gradient
        context.fillStyle = "black"; // Black color for the rectangle
        context.beginPath();
        context.moveTo(this.x + this.radius, this.y);
        context.lineTo(this.x + this.width - this.radius, this.y);
        context.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius);
        context.lineTo(this.x + this.width, this.y + this.height - this.radius);
        context.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - this.radius, this.y + this.height);
        context.lineTo(this.x + this.radius, this.y + this.height);
        context.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius);
        context.lineTo(this.x, this.y + this.radius);
        context.quadraticCurveTo(this.x, this.y, this.x + this.radius, this.y);
        context.closePath();
        context.fill();
        // Set text properties
        context.fillStyle = "#FFFFFF"; // White color for the text
        context.font = "bold 28px system-ui"; // Adjust font size and family as needed
        context.textAlign = "center";
        // Draw the text
        context.fillText(this.text, this.textX, this.textY);
        super.render(context);
    }
    setSize(canvas) {
        this.width = canvas.width - 70;
        this.height = 120;
    }
    calculateTextPosition() {
        this.textX = this.x + this.width / 2 + 8;
        this.textY = this.y + this.height / 2 + 8;
    }
}
