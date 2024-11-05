export class GameKeyboard {
    pressedKeys = new Set();
    addEventListeners() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
    getPressedKeys() {
        return this.pressedKeys;
    }
    handleKeyDown(event) {
        this.pressedKeys.add(event.key);
    }
    handleKeyUp(event) {
        this.pressedKeys.delete(event.key);
    }
}
