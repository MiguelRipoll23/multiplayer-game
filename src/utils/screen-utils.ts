import { GameFrame } from "../models/game-frame.js";
import { BaseMultiplayerScreen } from "../screens/base/base-multiplayer-screen.js";
import { MultiplayerScreen } from "../screens/interfaces/multiplayer-screen.js";

export class ScreenUtils {
  public static getScreenById(
    gameFrame: GameFrame,
    screenId: number
  ): MultiplayerScreen | null {
    const currentScreen = gameFrame.getCurrentScreen();

    if (currentScreen instanceof BaseMultiplayerScreen) {
      return currentScreen.getId() === screenId ? currentScreen : null;
    }

    const nextScreen = gameFrame.getNextScreen();

    if (nextScreen instanceof BaseMultiplayerScreen) {
      return nextScreen.getId() === screenId ? nextScreen : null;
    }

    return null;
  }
}
