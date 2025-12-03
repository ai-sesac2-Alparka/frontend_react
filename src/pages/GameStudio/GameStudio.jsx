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
import { quadrakillAdapter } from "../../api/quadrakillAdapter";
import "./GameStudio.css";

// 이미지 에셋 (필요시 경로 수정)
// NOTE: Using emojis for toolbar icons; remove unused image constants to avoid lint warnings.

const GameStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameFrameRef = useRef(null);

  // Context에서 게임 상태 가져오기
  const {
    gameTitle,
    projectId,
    setProjectId,
    setGameTitle,
    gameData,
    setGameData,
    snapshots,
    setSnapshots,
    setAssets,
    setAssetStamp,
  } = useGame();

  // URL 쿼리 파라미터에서 gameName/projectId 읽기 및 Context 업데이트
  const gameNameFromUrl = searchParams.get("gameName");
  const projectIdFromUrl = searchParams.get("projectId");
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (projectIdFromUrl && projectIdFromUrl !== projectId) {
      setProjectId(projectIdFromUrl);
    }
    // projectId 우선, gameName은 표시용으로만 사용
    if (gameNameFromUrl && gameNameFromUrl !== gameTitle) {
      setGameTitle(gameNameFromUrl);
    } else if (projectIdFromUrl && !gameTitle) {
      setGameTitle(projectIdFromUrl);
    }
  }, [
    searchParams,
    gameTitle,
    setGameTitle,
    gameNameFromUrl,
    projectIdFromUrl,
    projectId,
    setProjectId,
  ]);

  // projectId가 없으면 서버에서 resolve/create 시도 (기본 식별자는 projectId)
  useEffect(() => {
    const ensureProjectId = async () => {
      if (projectId || !(gameTitle || gameNameFromUrl)) return;
      const title = gameTitle || gameNameFromUrl;
      try {
        const res = await quadrakillAdapter.projects.resolve(title, {
          create: true,
          userId: "user-1",
        });
        if (res?.data?.id) {
          setProjectId(res.data.id);
        }
      } catch (err) {
        console.warn("프로젝트 resolve/create 실패:", err);
      }
    };
    ensureProjectId();
  }, [projectId, gameTitle, gameNameFromUrl, setProjectId]);

  // Draft가 비어 있을 경우 bootstrap 1회 시도
  useEffect(() => {
    const bootstrap = async () => {
      if (!projectId || bootstrapped) return;
      try {
        await quadrakillAdapter.projects.bootstrap(projectId);
      } catch (err) {
        console.warn("bootstrap 실패:", err);
      } finally {
        setBootstrapped(true);
      }
    };
    bootstrap();
  }, [projectId, bootstrapped]);

  // Hook을 통한 데이터 관리
  const { fetchSnapshots } = useSnapshotTree({
    gameName: gameTitle,
    projectId,
  });
  const { fetchGameData } = useGameData({ gameName: gameTitle, projectId });
  const { fetchAssets } = useAssets({ gameName: gameTitle, projectId });

  // 로컬 상태 관리
  const [activeTab, setActiveTab] = useState("data"); // game, assets, history, data
  // Chat messages are handled inside ChatPanel component now.
  const [isMuted, setIsMuted] = useState(false);
  const chatAddMessageRef = useRef(null);
  const [gameErrorBatch, setGameErrorBatch] = useState(null);

  // 페이지 로드 시 백엔드에서 데이터 불러오기
  useEffect(() => {
    if (!projectId) return; // projectId 없으면 로드 대기

    const loadInitialData = async () => {
      try {
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
    gameTitle,
    projectId,
    fetchSnapshots,
    fetchGameData,
    fetchAssets,
    setGameData,
    setSnapshots,
    setAssets,
    setAssetStamp,
  ]);

  const handleChatReady = (addMessageFn) => {
    chatAddMessageRef.current = addMessageFn;
  };

  // 쿼리 파라미터가 모두 없으면 안내 화면 표시 (projectId 또는 gameName 둘 중 하나만 있어도 진행)
  if (!gameNameFromUrl && !projectIdFromUrl && !projectId) {
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

  useEffect(() => {
    if (projectId && gameData && Object.keys(gameData || {}).length === 0) {
      setGameData({ value: "" });
    }
  }, [projectId, gameData, setGameData]);

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
          <label className="visually-hidden" htmlFor="project-selector">
            프로젝트 선택
          </label>
          <select
            id="project-selector"
            role="combobox"
            aria-label="프로젝트 선택"
            className="project-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value={projectId || ""}>
              {projectId || "프로젝트 선택"}
            </option>
          </select>
          <input
            type="text"
            className="game-title-input"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
          />
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
                iframeSrc={`http://localhost:8080/${gameTitle}/`}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((m) => !m)}
                onCopyLink={handleCopyLink}
                onFullscreen={() => {
                  /* can be used for additional tracking */
                }}
                onErrorBatch={handleErrorBatch}
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
                <SnapshotTree
                  gameName={gameTitle}
                  projectId={projectId}
                  showImportExport={false}
                />
              </div>
            )}
            {activeTab === "data" && (
              <div className="data-panel">
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <strong>버전</strong>
                    <div style={{ fontSize: 12 }}>
                      총 {snapshots?.length || 0}개
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    projectId: {projectId || "미설정"}
                  </div>
                </div>
                <DataEditor
                  data={gameData}
                  onDataChange={setGameData}
                  gameName={gameTitle}
                  projectId={projectId}
                  showImportExport={false}
                  hiddenTopLevelKeys={["assets"]}
                />
                <div style={{ marginTop: 16 }}>
                  <AssetManager
                    onPromptSubmit={handlePromptSubmit}
                    onSnapshotUpdate={(data) => {
                      if (data && data.versions) {
                        setSnapshots(data.versions);
                      }
                    }}
                  />
                </div>
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
        />
      </div>
      {/* asset modal moved to AssetManager component */}
    </div>
  );
};

export default GameStudio;
