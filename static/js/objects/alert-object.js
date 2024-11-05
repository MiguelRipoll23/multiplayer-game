import { BLUE_TEAM_COLOR, ORANGE_TEAM_COLOR, } from "../constants/colors-constants.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
export class AlertObject extends BaseAnimatedGameObject {
    canvas;
    text = "Unknown message";
    color = "white";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setInitialValues();
    }
    show(text, color = "white") {
        this.text = text;
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
        context.font = "lighter 30px system-ui";
        context.fillStyle = this.color;
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
