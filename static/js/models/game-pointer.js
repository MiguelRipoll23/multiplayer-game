export class GamePointer {
    x = 0;
    y = 0;
    pressed = false;
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    isPressed() {
        return this.pressed;
    }
    setPressed(pressed) {
        this.pressed = pressed;
    }
}
