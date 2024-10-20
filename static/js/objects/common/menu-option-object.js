import { PressableBaseGameObject } from "../base/pressable-game-object.js";
export class MenuOptionObject extends PressableBaseGameObject {
    index;
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
    handleMouseUp(event) {
        super.handleMouseUp(event);
    }
    render(context) {
        // Draw rectangle with gradient
        context.fillStyle = "black"; // Black color for the rectangle
        context.fillRect(this.x, this.y, this.width, this.height);
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
