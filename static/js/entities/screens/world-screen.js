import { GearStick } from "../objects/gear-stick.js";
import { Joystick } from "../objects/joystick.js";
import { LocalCar } from "../objects/local-car.js";
export class WorldScreen {
  SCREEN_ID = "WORLD_SCREEN";
  canvas;
  opacity = 0;
  sceneObjects;
  uiObjects;
  joystick = null;
  gearStick = null;
  constructor(canvas) {
    this.canvas = canvas;
    this.sceneObjects = [];
    this.uiObjects = [];
  }
  getId() {
    return this.SCREEN_ID;
  }
  update(deltaFrameMilliseconds) {
    this.updateObjects(this.sceneObjects, deltaFrameMilliseconds);
    this.updateObjects(this.uiObjects, deltaFrameMilliseconds);
  }
  render(context) {
    context.globalAlpha = this.opacity;
    this.renderObjects(this.sceneObjects, context);
    this.renderObjects(this.uiObjects, context);
    context.globalAlpha = 1;
  }
  addObjects() {
    this.addControls();
    this.addLocalCar();
  }
  getOpacity() {
    return this.opacity;
  }
  setOpacity(opacity) {
    this.opacity = opacity;
  }
  updateObjects(objects, deltaFrameMilliseconds) {
    objects.forEach((object) => object.update(deltaFrameMilliseconds));
  }
  renderObjects(objects, context) {
    objects.forEach((object) => object.render(context));
  }
  addControls() {
    this.gearStick = new GearStick(this.canvas);
    this.uiObjects.push(this.gearStick);
    this.joystick = new Joystick(this.canvas);
    this.uiObjects.push(this.joystick);
  }
  addLocalCar() {
    const localCar = new LocalCar(
      this.canvas.width / 2 - 25,
      this.canvas.height / 2 - 25,
      90,
      this.canvas
    );
    if (this.joystick && this.gearStick) {
      localCar.setControls(this.joystick, this.gearStick);
    }
    this.sceneObjects.push(localCar);
  }
}
