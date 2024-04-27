import { BaseCollidableGameObject } from "./base/base-collidable-game-object.js";
export class BoundaryObject extends BaseCollidableGameObject {
    constructor(x, y) {
        super(x, y);
        this.x = x;
        this.y = y;
    }
    load() {
        super.load();
    }
    update(deltaTimeStamp) { }
    render(context) {
        // Hitbox render
        super.render(context);
    }
}
