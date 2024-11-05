import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
export class AlertObject extends BaseAnimatedGameObject {
    canvas;
    text = "Unknown message";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setInitialValues();
    }
    show(text) {
        this.text = text;
        this.fadeIn(0.5);
    }
    render(context) {
        context.save();
        context.globalAlpha = this.opacity;
        context.font = "48px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, this.x, this.y);
        context.restore();
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
