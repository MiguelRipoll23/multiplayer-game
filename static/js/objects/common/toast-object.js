import { BaseAnimatedGameObject } from "../base/base-animated-object.js";
export class ToastObject extends BaseAnimatedGameObject {
    canvas;
    text = "Unknown";
    toastWidth = 0;
    toastHeight = 0;
    padding = 10;
    cornerRadius = 10;
    bottomMargin = 30; // Renamed to bottomMargin
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.configureToast();
    }
    show(text) {
        this.text = text;
        this.configureToast();
        this.fadeIn(0.2);
        this.scaleTo(1, 0.2);
    }
    configureToast() {
        this.resetToastProperties();
        const context = this.getCanvasContext();
        this.measureToastDimensions(context);
        this.setToastPosition();
    }
    resetToastProperties() {
        this.opacity = 0;
        this.scale = 0;
    }
    getCanvasContext() {
        const context = this.canvas.getContext("2d");
        if (!context)
            throw new Error("Unable to get canvas context");
        return context;
    }
    measureToastDimensions(context) {
        context.font = "16px Arial";
        const textWidth = context.measureText(this.text).width;
        this.toastWidth = textWidth + this.padding * 2;
        this.toastHeight = 30; // Fixed height for simplicity
    }
    setToastPosition() {
        const canvasHeight = this.canvas.height;
        this.x = (this.canvas.width - this.toastWidth) / 2;
        this.y = canvasHeight - this.bottomMargin - this.toastHeight;
    }
    render(context) {
        context.save();
        this.applyOpacity(context);
        this.applyTransformations(context);
        this.drawToastBackground(context);
        this.drawToastText(context);
        context.restore();
    }
    applyOpacity(context) {
        context.globalAlpha = this.opacity;
    }
    applyTransformations(context) {
        context.translate(this.x + this.toastWidth / 2, this.y + this.toastHeight / 2);
        context.scale(this.scale, this.scale);
        context.translate(-(this.x + this.toastWidth / 2), -(this.y + this.toastHeight / 2));
    }
    drawToastBackground(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.beginPath();
        this.drawRoundedRectangle(context);
        context.closePath();
        context.fill();
    }
    drawRoundedRectangle(context) {
        context.moveTo(this.x + this.cornerRadius, this.y);
        context.lineTo(this.x + this.toastWidth - this.cornerRadius, this.y);
        context.quadraticCurveTo(this.x + this.toastWidth, this.y, this.x + this.toastWidth, this.y + this.cornerRadius);
        context.lineTo(this.x + this.toastWidth, this.y + this.toastHeight - this.cornerRadius);
        context.quadraticCurveTo(this.x + this.toastWidth, this.y + this.toastHeight, this.x + this.toastWidth - this.cornerRadius, this.y + this.toastHeight);
        context.lineTo(this.x + this.cornerRadius, this.y + this.toastHeight);
        context.quadraticCurveTo(this.x, this.y + this.toastHeight, this.x, this.y + this.toastHeight - this.cornerRadius);
        context.lineTo(this.x, this.y + this.cornerRadius);
        context.quadraticCurveTo(this.x, this.y, this.x + this.cornerRadius, this.y);
    }
    drawToastText(context) {
        context.fillStyle = "white";
        context.font = "16px system-ui";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, this.x + this.toastWidth / 2, this.y + this.toastHeight / 2);
    }
}
