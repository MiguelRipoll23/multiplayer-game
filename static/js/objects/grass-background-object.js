import { BaseGameObject } from "./base/base-game-object.js";
export class GrassBackground extends BaseGameObject {
    TEXTURE_PATH = "./textures/grass12.png";
    image;
    constructor() {
        super();
        this.image = new Image();
        this.loadImage();
    }
    load() {
        this.loadImage();
    }
    update(deltaTimeStamp) {
        // No update logic required
    }
    render(context) {
        const pattern = context.createPattern(this.image, "repeat");
        if (pattern) {
            context.fillStyle = pattern;
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        }
    }
    loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            super.load();
        };
        this.image.src = this.TEXTURE_PATH;
    }
}
