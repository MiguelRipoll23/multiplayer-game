import {
  MultiplayerGameObject,
  StaticMultiplayerGameObject,
} from "../../objects/interfaces/multiplayer-game-object.js";
import { GameScreen } from "./game-screen.js";

export interface MultiplayerScreen extends GameScreen {
  getId(): number;
  getSyncableObjects(): MultiplayerGameObject[];
  getSyncableObjectClass(typeId: number): StaticMultiplayerGameObject | null;
  getSyncableObject(objectId: string): MultiplayerGameObject | null;
}
