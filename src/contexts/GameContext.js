// src/contexts/GameContext.js

import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameTitle, setGameTitle] = useState("나만의 멋진 게임");
  const [gameData, setGameData] = useState({});
  const [assets, setAssets] = useState([
    { id: 1, type: "image", name: "background", src: "/images/background.svg" },
    { id: 2, type: "image", name: "logo", src: "/images/logo.png" },
    { id: 3, type: "audio", name: "bgm", src: "" },
  ]);

  return (
    <GameContext.Provider
      value={{
        gameTitle,
        setGameTitle,
        gameData,
        setGameData,
        assets,
        setAssets,
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
