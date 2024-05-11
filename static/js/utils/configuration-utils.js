export function getConfigurationKey(key, gameState) {
    const configuration = gameState.getGameServer()
        .getConfiguration();
    if (configuration === null) {
        return null;
    }
    if ((key in configuration) === false) {
        return null;
    }
    return configuration[key];
}
