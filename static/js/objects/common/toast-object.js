import { BaseAnimatedGameObject } from "../base/base-animated-object.js";
export class ToastObject extends BaseAnimatedGameObject {
    canvas;
    text = "Unknown";
    width = 0;
    height = 0;
    padding = 10;
    topMargin = 160; // Changed bottomMargin to topMargin
    cornerRadius = 10; // Corner radius for rounded corners
    context;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.reset();
    }
    show(text) {
        this.text = text;
        this.reset();
        this.fadeIn(0.2);
        this.scaleTo(1, 0.2);
    }
    hide() {
        this.fadeOut(0.2);
        this.scaleTo(0, 0.2);
    }
    reset() {
        this.opacity = 0;
        this.scale = 0;
        this.measureDimensions();
        this.setPosition();
    }
    render(context) {
        context.save();
        this.applyOpacity(context);
        this.applyTransformations(context);
        this.drawToastBackground(context);
        this.drawToastText(context);
        context.restore();
    }
    measureDimensions() {
        this.context.font = "16px Arial";
        const textWidth = this.context.measureText(this.text).width;
        this.width = textWidth + this.padding * 2;
        this.height = 30; // Fixed height for simplicity
    }
    setPosition() {
        const canvasHeight = this.canvas.height;
        this.x = (this.canvas.width - this.width) / 2;
        this.y = this.topMargin; // Set y position based on topMargin
    }
    applyOpacity(context) {
        context.globalAlpha = this.opacity;
    }
    applyTransformations(context) {
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.scale(this.scale, this.scale);
        context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    }
    drawToastBackground(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.beginPath();
        // Rounded rectangle with corner radius
        context.moveTo(this.x + this.cornerRadius, this.y);
        context.lineTo(this.x + this.width - this.cornerRadius, this.y);
        context.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, this.cornerRadius);
        context.lineTo(this.x + this.width, this.y + this.height - this.cornerRadius);
        context.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - this.cornerRadius, this.y + this.height, this.cornerRadius);
        context.lineTo(this.x + this.cornerRadius, this.y + this.height);
        context.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - this.cornerRadius, this.cornerRadius);
        context.lineTo(this.x, this.y + this.cornerRadius);
        context.arcTo(this.x, this.y, this.x + this.cornerRadius, this.y, this.cornerRadius);
        context.closePath();
        context.fill();
    }
    drawToastText(context) {
        context.fillStyle = "white";
        context.font = "16px system-ui";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}
