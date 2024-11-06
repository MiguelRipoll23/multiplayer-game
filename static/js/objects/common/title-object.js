import { BasePositionableGameObject } from "../base/base-positionable-game-object.js";
export class TitleObject extends BasePositionableGameObject {
    text = "Unknown";
    constructor() {
        super();
        this.x = 30;
        this.y = 55;
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
