import { PressableWindowObject } from "./common/pressable-window-object.js";
export class ServerMessageWindow extends PressableWindowObject {
    index = 0;
    constructor(canvas) {
        super(canvas);
    }
    getIndex() {
        return this.index;
    }
    openMessage(index, title, content) {
        this.index = index;
        super.open(title, content);
    }
    update(deltaTimeStamp) {
        if (this.isPressed()) {
            this.close();
            console.log("Closed server message window with index:", this.index);
        }
        super.update(deltaTimeStamp);
    }
}
