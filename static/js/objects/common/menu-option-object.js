import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
export class MenuOptionObject extends BasePressableGameObject {
    index = 0;
    content = "Unknown";
    radius = 15; // Base radius for rounded corners
    textX = 0;
    textY = 0;
    // Store irregularity values for each corner and side
    topLeftIrregularity;
    topRightIrregularity;
    bottomRightIrregularity;
    bottomLeftIrregularity;
    constructor(canvas, index, content) {
        super();
        this.index = index;
        this.content = content;
        this.setSize(canvas);
        // Generate and store irregularity values (these are only generated once)
        this.topLeftIrregularity = this.getRandomIrregularity();
        this.topRightIrregularity = this.getRandomIrregularity();
        this.bottomRightIrregularity = this.getRandomIrregularity();
        this.bottomLeftIrregularity = this.getRandomIrregularity();
    }
    // Generate a random irregularity value
    getRandomIrregularity() {
        return Math.random() * 4 - 2; // Between -2 and 2 for subtle irregularity
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
        context.save(); // Save current context state before applying transformations
        // Apply a small rotation to make the buttons look tilted
        const tiltAngle = this.index === 0
            ? -0.05
            : (this.index === 1 ? 0.05 : -0.02); // Different angles for each button
        context.translate(this.x + this.width / 2, this.y + this.height / 2); // Move the origin to the center of the button
        context.rotate(tiltAngle); // Rotate the canvas slightly
        context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2)); // Move the origin back
        // Use the stored irregularity values for each corner and side
        context.beginPath();
        // Top left corner
        context.moveTo(this.x + this.radius + this.topLeftIrregularity, this.y);
        context.lineTo(this.x + this.width - this.radius + this.topRightIrregularity, this.y);
        // Top right corner
        context.quadraticCurveTo(this.x + this.width + this.topRightIrregularity, this.y + this.topRightIrregularity, this.x + this.width, this.y + this.radius + this.topRightIrregularity);
        // Right side
        context.lineTo(this.x + this.width, this.y + this.height - this.radius + this.bottomRightIrregularity);
        // Bottom right corner
        context.quadraticCurveTo(this.x + this.width + this.bottomRightIrregularity, this.y + this.height + this.bottomRightIrregularity, this.x + this.width - this.radius + this.bottomRightIrregularity, this.y + this.height);
        // Bottom side
        context.lineTo(this.x + this.radius + this.bottomLeftIrregularity, this.y + this.height);
        // Bottom left corner
        context.quadraticCurveTo(this.x + this.bottomLeftIrregularity, this.y + this.height + this.bottomLeftIrregularity, this.x, this.y + this.height - this.radius + this.bottomLeftIrregularity);
        // Left side
        context.lineTo(this.x, this.y + this.radius + this.topLeftIrregularity);
        // Top left corner
        context.quadraticCurveTo(this.x + this.topLeftIrregularity, this.y + this.topLeftIrregularity, this.x + this.radius + this.topLeftIrregularity, this.y);
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
