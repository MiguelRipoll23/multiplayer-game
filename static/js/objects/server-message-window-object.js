import { CloseableWindowObject } from "./common/closeable-window-object.js";
export class ServerMessageWindowObject extends CloseableWindowObject {
    index = 0;
    length = 0;
    next = false;
    constructor(canvas) {
        super(canvas);
    }
    getIndex() {
        return this.index;
    }
    getNext() {
        return this.next;
    }
    openMessage(index, length, title, content) {
        this.index = index;
        this.length = length;
        this.next = false;
        console.log(`Opening server message message (${index + 1}/${length})`);
        const titleBarText = `SERVER MESSAGE (${index + 1}/${length})`;
        super.open(titleBarText, title, content);
    }
    close() {
        this.next = true;
    }
    closeAll() {
        this.next = false;
        super.close();
    }
}
