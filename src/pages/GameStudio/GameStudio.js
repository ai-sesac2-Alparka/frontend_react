// src/pages/GameStudio/GameStudio.js

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import SnapshotTree from "../../components/SnapshotTree/SnapshotTree";
import DataEditor from "../../components/DataEditor/DataEditor";
import AssetManager from "../../components/AssetManager/AssetManager";
import ChatPanel from "../../components/ChatPanel/ChatPanel";
import GameRunner from "../../components/GameRunner/GameRunner";
import { useGame } from "../../contexts/GameContext";
import { useSnapshotTree } from "../../hooks/useSnapshotTree";
import { useGameData } from "../../hooks/useGameData";
import { useAssets } from "../../hooks/useAssets";
import { changeGameTitle, getGameTitle } from "../../api/backend";
import "./GameStudio.css";

// 이미지 에셋 (필요시 경로 수정)
// NOTE: Using emojis for toolbar icons; remove unused image constants to avoid lint warnings.

const GameStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameFrameRef = useRef(null);

  // Context에서 게임 상태 가져오기
  const {
    gameName,
    setGameName,
    displayTitle,
    setDisplayTitle,
    gameData,
    setGameData,
    setSnapshots,
    setAssets,
    setAssetStamp,
  } = useGame();

  // URL 쿼리 파라미터에서 gameName 읽기 및 Context 업데이트
  const gameNameFromUrl = searchParams.get("gameName");

  useEffect(() => {
    if (gameNameFromUrl && gameNameFromUrl !== gameName) {
      setGameName(gameNameFromUrl);
      // displayTitle은 게임 데이터에서 로드되거나 사용자가 입력
      if (!displayTitle) {
        setDisplayTitle(gameNameFromUrl); // 초기값으로 ID 사용
      }
    }
  }, [
    searchParams,
    gameName,
    setGameName,
    displayTitle,
    setDisplayTitle,
    gameNameFromUrl,
  ]);

  // Hook을 통한 데이터 관리 (gameName을 서버 통신에 사용)
  const { fetchSnapshots } = useSnapshotTree(gameName);
  const { fetchGameData } = useGameData(gameName);
  const { fetchAssets } = useAssets(gameName);

  // 로컬 상태 관리
  const [activeTab, setActiveTab] = useState("game"); // game, assets, history, data
  // Chat messages are handled inside ChatPanel component now.
  const [isMuted, setIsMuted] = useState(false);
  const chatAddMessageRef = useRef(null);
  const [gameErrorBatch, setGameErrorBatch] = useState(null);
  const [reloadToken, setReloadToken] = useState(0); // 게임 iframe 리로드용
  const [isEditingTitle, setIsEditingTitle] = useState(false); // 타이틀 수정 모드

  // 페이지 로드 시 백엔드에서 데이터 불러오기
  useEffect(() => {
    if (!gameNameFromUrl) return; // 쿼리 없으면 데이터 로드 건너뛰기

    const loadInitialData = async () => {
      try {
        // 게임 타이틀 조회
        try {
          const titleResponse = await getGameTitle(gameNameFromUrl);
          const title = titleResponse?.data?.title || titleResponse?.data;
          if (title && typeof title === "string") {
            setDisplayTitle(title);
          }
        } catch (titleError) {
          console.warn("게임 타이틀 로드 실패:", titleError);
        }

        // Hook을 통해 스냅샷 로그 불러오기
        const snapshotData = await fetchSnapshots();
        if (snapshotData) {
          setSnapshots(snapshotData);
        }

        // Hook을 통해 게임 데이터 불러오기
        const gameDataResult = await fetchGameData();
        if (gameDataResult) {
          setGameData(gameDataResult);
        }

        // Hook을 통해 에셋 불러오기
        const assetsResult = await fetchAssets();
        if (assetsResult) {
          setAssets(assetsResult);
          setAssetStamp(Date.now()); // 초기 로드 시 스탬프 갱신
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };

    loadInitialData();
  }, [
    gameName,
    gameNameFromUrl,
    fetchSnapshots,
    fetchGameData,
    fetchAssets,
    setGameData,
    setSnapshots,
    setAssets,
    setAssetStamp,
    setDisplayTitle,
  ]);

  const handleChatReady = (addMessageFn) => {
    chatAddMessageRef.current = addMessageFn;
  };

  // 타이틀 변경 확인 처리
  const handleTitleEditConfirm = async () => {
    if (!gameName || !displayTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await changeGameTitle(gameName, displayTitle.trim());
      console.log("타이틀 변경 성공:", displayTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("타이틀 변경 실패:", error);
      alert("타이틀 변경에 실패했습니다.");
    }
  };

  // 쿼리 파라미터가 없으면 안내 화면 표시
  if (!gameNameFromUrl) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
          fontFamily: "Paperlogy-5, sans-serif",
        }}
      >
        <h2>게임을 선택해주세요</h2>
        <p>URL에 게임 이름을 쿼리 파라미터로 전달해주세요.</p>
        <p style={{ color: "#000000ff", fontSize: "14px" }}>
          예: /gamestudio?gameName=my_game
        </p>
      </div>
    );
  }

  const handlePromptSubmit = (promptText, asset) => {
    // 포맷된 메시지를 채팅에 추가
    const userMsg = {
      type: "user",
      text: `에셋 '${asset?.name ?? ""}'에 대한 요청: ${promptText}`,
    };
    if (chatAddMessageRef.current) chatAddMessageRef.current(userMsg);
    // AI 시뮬레이션 응답
    setTimeout(() => {
      if (chatAddMessageRef.current)
        chatAddMessageRef.current({
          type: "ai",
          text: `에셋 '${asset?.name ?? ""}' 처리 완료 (샘플 응답)`,
        });
    }, 800);
  };

  const handleErrorBatch = (batchData) => {
    console.log("GameStudio에서 에러 배치 수신:", batchData);
    setGameErrorBatch(batchData);
  };

  const handleErrorBatchHandled = () => {
    setGameErrorBatch(null);
  };

  const handleGameReload = () => {
    setReloadToken((prev) => prev + 1);
  };

  // 복사: iframe src를 우선으로, 없으면 현재 페이지 URL을 복사
  const handleCopyLink = async () => {
    const iframe = gameFrameRef.current;
    const link = iframe?.src || window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      window.alert("링크가 복사되었습니다.");
    } catch (err) {
      console.error("copy failed", err);
    }
  };
  // ChatPanel manages its own messages and input.

  // 핸들러는 GameRunner로 전달됩니다. gameFrameRef는 보존(필요 시 참조용).

  // GameStudio no longer manages asset modal internals; AssetManager handles uploads/prompts.

  return (
    <div className="game-studio">
      {/* --- 1. 상단 헤더 (제목, 저장, 업로드) --- */}
      <Header />
      <header className="studio-header">
        <div className="header-left">
          <input
            type="text"
            className="game-title-input"
            value={displayTitle}
            onChange={(e) => setDisplayTitle(e.target.value)}
            placeholder="게임 타이틀을 입력하세요"
            readOnly={!isEditingTitle}
          />
          <button
            className={`btn-edit-title ${isEditingTitle ? "editing" : ""}`}
            onClick={() => {
              if (isEditingTitle) {
                handleTitleEditConfirm();
              } else {
                setIsEditingTitle(true);
              }
            }}
          >
            {isEditingTitle ? "✓" : "✏️"}
          </button>
        </div>
        <div className="header-right">
          <button className="btn-secondary">임시 저장</button>
          <button className="btn-primary" onClick={() => navigate("/arcade")}>
            업로드
          </button>
        </div>
      </header>

      <div className="studio-body">
        {/* --- 2. 왼쪽: 메인 패널 (게임/에셋/히스토리/데이터) --- */}
        <div className="main-panel">
          {/* 탭 메뉴 */}
          <div className="tab-menu">
            {["game", "assets", "history", "data"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "game" && "🎮 게임"}
                {tab === "assets" && "🎨 에셋"}
                {tab === "history" && "🕒 히스토리"}
                {tab === "data" && "⚙️ 데이터"}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="tab-content">
            {activeTab === "game" && (
              <GameRunner
                iframeSrc={`http://localhost:8080/${gameName}/`}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((m) => !m)}
                onCopyLink={handleCopyLink}
                onFullscreen={() => {
                  /* can be used for additional tracking */
                }}
                onErrorBatch={handleErrorBatch}
                reloadToken={reloadToken}
              />
            )}
            {activeTab === "assets" && (
              <div className="assets-panel">
                <AssetManager
                  onPromptSubmit={handlePromptSubmit}
                  onSnapshotUpdate={(data) => {
                    if (data && data.versions) {
                      setSnapshots(data.versions);
                    }
                  }}
                />
              </div>
            )}
            {activeTab === "history" && (
              <div className="history-panel">
                <SnapshotTree gameName={gameName} showImportExport={false} />
              </div>
            )}
            {activeTab === "data" && (
              <div className="data-panel">
                <DataEditor
                  data={gameData}
                  onDataChange={setGameData}
                  gameName={gameName}
                  showImportExport={false}
                  hiddenTopLevelKeys={["assets"]}
                />
              </div>
            )}
          </div>
        </div>

        {/* --- 3. 오른쪽: 채팅 패널 (분리된 컴포넌트) --- */}
        <ChatPanel
          initialMessages={[
            {
              type: "ai",
              text: "게임 생성이 완료되었습니다! 수정하고 싶은 내용이 있다면 말씀해주세요.",
            },
          ]}
          onReady={handleChatReady}
          gameErrorBatch={gameErrorBatch}
          onErrorBatchHandled={handleErrorBatchHandled}
          onGameReload={handleGameReload}
        />
      </div>
      {/* asset modal moved to AssetManager component */}
    </div>
  );
};

export default GameStudio;
