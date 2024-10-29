export class GamePointer {
    x = 0;
    y = 0;
    type = "mouse";
    pressing = false;
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
    isPressing() {
        return this.pressing;
    }
    setPressing(pressing) {
        this.pressing = pressing;
    }
    isPressed() {
        return this.pressed;
    }
    setPressed(pressed) {
        this.pressed = pressed;
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    reset() {
        this.x = -1;
        this.y = -1;
        this.pressing = false;
        this.pressed = false;
    }
}
