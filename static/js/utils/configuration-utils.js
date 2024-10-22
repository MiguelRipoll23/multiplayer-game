export function getConfigurationKey(key, defaultValue, gameState) {
    const configuration = gameState.getGameServer()
        .getConfiguration();
    if (configuration === null) {
        return defaultValue;
    }
    if ((key in configuration) === false) {
        return defaultValue;
    }
    return configuration[key];
}
