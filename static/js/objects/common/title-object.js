import { BaseGameObject } from "../base/base-game-object.js";
export class TitleObject extends BaseGameObject {
    canvas;
    x = 30;
    y = 55;
    text = "Unknown";
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    setText(text) {
        this.text = text;
    }
    render(context) {
        context.fillStyle = "white";
        context.font = "lighter 38px system-ui";
        context.textAlign = "left";
        context.fillText(this.text, this.x, this.y);
    }
}
