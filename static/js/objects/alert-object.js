import { BLUE_TEAM_COLOR, ORANGE_TEAM_COLOR, } from "../constants/colors-constants.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
export class AlertObject extends BaseAnimatedGameObject {
    canvas;
    multilineText = ["Unknown", "message"];
    color = "white";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setInitialValues();
    }
    show(text, color = "white") {
        this.multilineText = text;
        if (color === "orange") {
            this.color = ORANGE_TEAM_COLOR;
        }
        else if (color === "blue") {
            this.color = BLUE_TEAM_COLOR;
        }
        else {
            this.color = color;
        }
        this.fadeIn(0.5);
    }
    render(context) {
        context.save();
        context.globalAlpha = this.opacity;
        this.setFontStyle(context);
        this.renderMultilineText(context);
        context.restore();
    }
    setFontStyle(context) {
        context.font = "42px system-ui";
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
    }
    renderMultilineText(context) {
        const lineHeight = 42; // Adjust as needed for line spacing
        this.multilineText.forEach((line, index) => {
            const yPosition = this.y + index * lineHeight;
            this.drawTextWithStroke(context, line, this.x, yPosition);
        });
    }
    drawTextWithStroke(context, text, x, y) {
        // Draw filled text
        context.fillText(text, x, y);
        // Set up stroke style and draw stroke text
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.lineWidth = 1;
        context.strokeText(text, x, y);
    }
    setInitialValues() {
        this.opacity = 0;
        this.setCenterPosition();
    }
    setCenterPosition() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
    }
}
