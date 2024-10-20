import { PressableWindowObject } from "./common/pressable-window-object.js";
export class NewsObject extends PressableWindowObject {
    index = 0;
    constructor(canvas) {
        super(canvas);
    }
    getIndex() {
        return this.index;
    }
    openPost(index, title, content) {
        this.index = index;
        super.open(title, content);
    }
}
