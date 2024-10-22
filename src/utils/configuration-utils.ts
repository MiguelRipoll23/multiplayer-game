import { GameState } from "../models/game-state.js";

export function getConfigurationKey<T>(
  key: string,
  defaultValue: T,
  gameState: GameState,
): T {
  const configuration: { [key: string]: any } | null = gameState.getGameServer()
    .getConfiguration();

  if (configuration === null) {
    return defaultValue;
  }

  if ((key in configuration) === false) {
    return defaultValue;
  }

  return configuration[key];
}
