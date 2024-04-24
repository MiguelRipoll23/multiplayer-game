import { Player } from "./player.js";
export class LocalPlayer extends Player {
    joystick = null;
    gearStick = null;
    constructor(name) {
        super(name);
        this.name = name;
    }
    setControls(joystick, gearStick) {
        this.joystick = joystick;
        this.gearStick = gearStick;
    }
    setJoystick(joystick) {
        this.joystick =
        ;
    }
    update(deltaTimeStamp) {
        // TODO
    }
    render(context) {
        // TODO
    }
}
