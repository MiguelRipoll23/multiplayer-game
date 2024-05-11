import { GameState } from "../models/game-state.js";

export function getConfigurationKey<T>(
  key: string,
  gameState: GameState,
): T | null {
  const configuration: { [key: string]: any } | null = gameState.getGameServer()
    .getConfiguration();

  if (configuration === null) {
    return null;
  }

  if ((key in configuration) === false) {
    return null;
  }

  return configuration[key];
}
