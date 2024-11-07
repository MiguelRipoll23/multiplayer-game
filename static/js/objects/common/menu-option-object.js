import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
export class MenuOptionObject extends BasePressableGameObject {
    index = 0;
    content = "Unknown";
    radius = 15; // Base radius for rounded corners
    textX = 0;
    textY = 0;
    constructor(canvas, index, content) {
        super();
        this.index = index;
        this.content = content;
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
        this.angle = this.index === 0 ? -0.05 : this.index === 1 ? 0.05 : -0.02;
        this.calculateTextPosition();
    }
    render(context) {
        context.save(); // Save current context state before applying transformations
        // Apply a small rotation to make the buttons look tilted
        context.translate(this.x + this.width / 2, this.y + this.height / 2); // Move the origin to the center of the button
        context.rotate(this.angle); // Rotate the canvas slightly
        context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2)); // Move the origin back
        // Use the stored irregularity values for each corner and side
        context.beginPath();
        // Top left corner
        context.moveTo(this.x + this.radius, this.y);
        context.lineTo(this.x + this.width - this.radius, this.y);
        // Top right corner
        context.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius);
        // Right side
        context.lineTo(this.x + this.width, this.y + this.height - this.radius);
        // Bottom right corner
        context.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - this.radius, this.y + this.height);
        // Bottom side
        context.lineTo(this.x + this.radius, this.y + this.height);
        // Bottom left corner
        context.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius);
        // Left side
        context.lineTo(this.x, this.y + this.radius);
        // Top left corner
        context.quadraticCurveTo(this.x, this.y, this.x + this.radius, this.y);
        context.closePath();
        // Set colors based on the button's index (to match the image)
        if (this.pressed || this.hovering) {
            context.fillStyle = "#7ed321"; // Green for the second button
        }
        else {
            context.fillStyle = "#4a90e2";
        }
        context.fill();
        // Set text properties
        context.fillStyle = "#FFFFFF"; // White color for the text
        context.font = "bold 28px system-ui"; // Adjust font size and family as needed
        context.textAlign = "center";
        // Draw the text
        context.fillText(this.content, this.textX, this.textY);
        context.restore(); // Restore the canvas state to avoid affecting other elements
        super.render(context);
    }
    setSize(canvas) {
        this.width = canvas.width - 60;
        this.height = 120;
    }
    calculateTextPosition() {
        this.textX = this.x + this.width / 2 + 8;
        this.textY = this.y + this.height / 2 + 8;
    }
}
