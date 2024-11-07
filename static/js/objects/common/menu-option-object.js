import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
export class MenuOptionObject extends BasePressableGameObject {
    index = 0;
    content = "Unknown";
    textX = 0;
    textY = 0;
    pinchFactor = 12; // Control the pinch depth for the sides
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
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.angle);
        context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        context.beginPath();
        // Top side with single pinch in the center
        context.moveTo(this.x + this.pinchFactor, this.y);
        context.quadraticCurveTo(this.x + this.width / 2, this.y - this.pinchFactor, // Pinch inward at the center
        this.x + this.width - this.pinchFactor, this.y);
        // Top right corner transitioning from top side to right side
        context.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.pinchFactor);
        // Right side with single pinch in the center
        context.lineTo(this.x + this.width, this.y + this.pinchFactor);
        context.quadraticCurveTo(this.x + this.width + this.pinchFactor / 2, // Pinch inward at the center
        this.y + this.height / 2, this.x + this.width, this.y + this.height - this.pinchFactor);
        // Bottom right corner transitioning from right side to bottom side
        context.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - this.pinchFactor, this.y + this.height);
        // Bottom side with single pinch in the center
        context.lineTo(this.x + this.width - this.pinchFactor, this.y + this.height);
        context.quadraticCurveTo(this.x + this.width / 2, this.y + this.height + this.pinchFactor, // Pinch inward at the center
        this.x + this.pinchFactor, this.y + this.height);
        // Bottom left corner transitioning from bottom side to left side
        context.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.pinchFactor);
        // Left side with single pinch in the center
        context.lineTo(this.x, this.y + this.height - this.pinchFactor);
        context.quadraticCurveTo(this.x - this.pinchFactor / 2, // Pinch inward at the center
        this.y + this.height / 2, this.x, this.y + this.pinchFactor);
        // Top left corner transitioning from left side to top side
        context.quadraticCurveTo(this.x, this.y, this.x + this.pinchFactor, this.y);
        context.closePath();
        if (this.pressed || this.hovering) {
            context.fillStyle = "#7ed321";
        }
        else {
            context.fillStyle = "#4a90e2";
        }
        context.fill();
        context.fillStyle = "#FFFFFF";
        context.font = "bold 28px system-ui";
        context.textAlign = "center";
        context.fillText(this.content, this.textX, this.textY);
        context.restore();
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
