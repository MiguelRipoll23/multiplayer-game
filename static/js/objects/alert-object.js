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
        this.fadeIn(0.3);
        this.scaleTo(1, 0.3);
    }
    hide() {
        this.fadeOut(0.3);
        this.scaleTo(0, 0.3);
    }
    render(context) {
        context.save();
        context.globalAlpha = this.opacity;
        this.setTransformOrigin(context);
        this.setFontStyle(context);
        this.renderMultilineText(context);
        context.restore();
    }
    setTransformOrigin(context) {
        context.translate(this.x, this.y);
        context.scale(this.scale, this.scale);
        context.translate(-this.x, -this.y);
    }
    setFontStyle(context) {
        context.font = "44px system-ui";
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        // Adding black shadow to text for readability
        context.shadowColor = "black";
        context.shadowOffsetX = 0; // Horizontal offset of shadow
        context.shadowOffsetY = 0; // Vertical offset of shadow
        context.shadowBlur = 10; // Blur effect for the shadow
    }
    renderMultilineText(context) {
        const lineHeight = 42; // Adjust as needed for line spacing
        this.multilineText.forEach((line, index) => {
            const yPosition = this.y + index * lineHeight;
            this.drawText(context, line, this.x, yPosition);
        });
    }
    drawText(context, text, x, y) {
        // Draw filled text with shadow applied
        context.fillText(text, x, y);
    }
    setInitialValues() {
        this.opacity = 0;
        this.scale = 0;
        this.setCenterPosition();
    }
    setCenterPosition() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
    }
}
