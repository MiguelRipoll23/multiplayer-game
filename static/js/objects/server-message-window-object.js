import { CloseableWindowObject } from "./common/closeable-window-object.js";
export class ServerMessageWindowObject extends CloseableWindowObject {
    index = 0;
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
        this.next = false;
        const pages = `${index + 1}/${length}`;
        console.log(`Opening server message message (${pages})`);
        super.open(`SERVER MESSAGE (${pages})`, title, content);
    }
    close() {
        this.next = true;
    }
    closeAll() {
        this.next = false;
        super.close();
    }
}
