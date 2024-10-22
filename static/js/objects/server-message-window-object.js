import { CloseableWindowObject } from "./common/closeable-window-object.js";
export class ServerMessageWindowObject extends CloseableWindowObject {
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
}
