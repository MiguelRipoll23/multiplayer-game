export class HitboxObject {
    x;
    y;
    width;
    height;
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    setX(x) {
        this.x = x;
    }
    getX() {
        return this.x;
    }
    setY(y) {
        this.y = y;
    }
    getY() {
        return this.y;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    render(context) {
        context.save(); // Save the current context state
        context.strokeStyle = "#ff0000"; // Red color
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.restore(); // Restore the context state
    }
}
