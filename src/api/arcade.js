import { backendApi } from "./index";

/**
 * Get all arcade games
 * @param {string} category - Optional category filter ('all', 'action', 'puzzle', etc.)
 * @returns {Promise} Axios response promise with games array
 */
export const getArcadeGames = (category = "all") => {
  return backendApi.get("/arcade/games", {
    params: category !== "all" ? { category } : {},
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

/**
 * Get trending/featured game for arcade banner
 * @returns {Promise} Axios response promise with single game object
 */
export const getTrendingGame = () => {
  return backendApi.get("/arcade/trending", {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

/**
 * Get user's created games
 * @param {string} userId - Optional user ID (if not using session)
 * @returns {Promise} Axios response promise with games array
 */
export const getUserCreatedGames = (userId = null) => {
  return backendApi.get("/user/created", {
    params: userId ? { user_id: userId } : {},
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

/**
 * Get user's liked/favorited games
 * @param {string} userId - Optional user ID (if not using session)
 * @returns {Promise} Axios response promise with games array
 */
export const getUserLikedGames = (userId = null) => {
  return backendApi.get("/user/liked", {
    params: userId ? { user_id: userId } : {},
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

/**
 * Get user's recently played games
 * @param {string} userId - Optional user ID (if not using session)
 * @returns {Promise} Axios response promise with games array
 */
export const getUserRecentGames = (userId = null) => {
  return backendApi.get("/user/recent", {
    params: userId ? { user_id: userId } : {},
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

/**
 * Get showcase games for home page
 * @param {number} limit - Maximum number of games to return
 * @returns {Promise} Axios response promise with games array
 */
export const getShowcaseGames = (limit = 4) => {
  return backendApi.get("/showcase/games", {
    params: { limit },
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });
};
