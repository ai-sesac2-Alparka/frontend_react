// src/contexts/GameContext.js

import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameTitle, setGameTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [gameData, setGameData] = useState({});
  const [snapshots, setSnapshots] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetStamp, setAssetStamp] = useState(Date.now());

  return (
    <GameContext.Provider
      value={{
        gameTitle,
        setGameTitle,
        projectId,
        setProjectId,
        gameData,
        setGameData,
        snapshots,
        setSnapshots,
        assets,
        setAssets,
        assetStamp,
        setAssetStamp,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
