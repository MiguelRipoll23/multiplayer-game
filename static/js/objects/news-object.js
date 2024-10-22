import { PressableWindowObject } from "./common/pressable-window-object.js";
export class MessageWindowObject extends PressableWindowObject {
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
  update(deltaTimeStamp) {
    if (this.isPressed()) {
      this.close();
      console.log("Closed message post window with index:", this.index);
    }
    super.update(deltaTimeStamp);
  }
}
