import { CloseableWindowObject } from "./common/closeable-window-object.js";
export class ServerMessageWindowObject extends CloseableWindowObject {
    index = 0;
    next = true;
    constructor(canvas) {
        super(canvas);
    }
    getIndex() {
        return this.index;
    }
    getNext() {
        return this.next;
    }
    openMessage(index, title, content) {
        this.index = index;
        this.next = false;
        super.open(title, content);
    }
    close() {
        this.next = true;
    }
    closeAll() {
        super.close();
    }
}
