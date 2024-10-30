export class GamePointer {
    x = 0;
    y = 0;
    initialX = 0;
    initialY = 0;
    type = "mouse";
    pressing = false;
    pressed = false;
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getInitialX() {
        return this.initialX;
    }
    getInitialY() {
        return this.initialY;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    setInitialX(x) {
        this.initialX = x;
    }
    setInitialY(y) {
        this.initialY = y;
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
        this.initialX = -1;
        this.initialY = -1;
        this.pressing = false;
        this.pressed = false;
    }
}
