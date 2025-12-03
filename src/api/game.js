import { gameApi } from "./index";

/**
 * Get game metadata
 * @param {string} gameId - Game ID
 * @returns {Promise} Axios response promise
 */
export const getGameMetadata = (gameId) => {
  return gameApi.get(`/${gameId}/game_metadata`);
};
