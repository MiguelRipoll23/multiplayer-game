import { GameState } from "../models/game-state.js";
import { ObjectStateType } from "../enums/object-state-type.js";
import { MultiplayerGameObject } from "../objects/interfaces/multiplayer-game-object.js";
import { WebRTCPeer } from "../services/interfaces/webrtc-peer.js";

export class ObjectUtils {
  public static skipLocalObject(
    multiplayerObject: MultiplayerGameObject
  ): boolean {
    return multiplayerObject.getId() === null;
  }

  public static handleInactiveObject(
    multiplayerObject: MultiplayerGameObject
  ): void {
    if (multiplayerObject.getState() === ObjectStateType.Inactive) {
      multiplayerObject.setRemoved(true);
    }
  }

  public static isInvalidOwner(
    webrtcPeer: WebRTCPeer,
    ownerId: string
  ): boolean {
    if (webrtcPeer.getPlayer()?.isHost()) {
      return false;
    }

    return webrtcPeer.getPlayer()?.getId() !== ownerId;
  }

  public static updateOwnerIfHost(
    gameState: GameState,
    multiplayerObject: MultiplayerGameObject
  ) {
    if (multiplayerObject.getOwner() === null) {
      const host = gameState.getGameMatch()?.getHost() ?? null;
      multiplayerObject.setOwner(host);
    }
  }
}
