export const API_HTTP_PROTOCOL = "https://";
export const API_WS_PROTOCOL = "wss://";
export const API_HOSTNAME = "gameserver.deno.dev";
export const API_PATH = "/api";
export const API_VERSION = "/v1";

export const API_BASE_URL =
  API_HTTP_PROTOCOL + API_HOSTNAME + API_PATH + API_VERSION;

export const WEBSOCKET_BASE_URL =
  API_WS_PROTOCOL + API_HOSTNAME + API_PATH + API_VERSION;

export const VERSION_ENDPOINT = "/version";
export const REGISTER_ENDPOINT = "/register";
export const CONFIGURATION_ENDPOINT = "/configuration";
export const WEBSOCKET_ENDPOINT = "/websocket";
export const MESSAGES_ENDPOINT = "/messages";
export const MATCHES_FIND_ENDPOINT = "/matches/find";
export const MATCHES_ADVERTISE_ENDPOINT = "/matches/advertise";
export const MATCHES_REMOVE_ENDPOINT = "/matches/remove";

export const SCOREBOARD_PATH = "/scoreboard";
export const SCOREBOARD_SAVE_SCORE_PATH = `${SCOREBOARD_PATH}/saveScore`;
export const SCOREBOARD_GET_RANKING_PATH = `${SCOREBOARD_PATH}/getRanking`;
