// src/pages/GamePlay/GamePlay.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import { getGameMetadata } from "../../api/backend";
import "./GamePlay.css";

const GamePlay = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const gameFrameRef = useRef(null);

  // 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [iframeSrc, setIframeSrc] = useState("");

  // 게임 메타데이터 로드
  useEffect(() => {
    const loadGameMetadata = async () => {
      if (!gameId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getGameMetadata(gameId);
        const data = response.data;

        setMetadata(data);
        setLikeCount(data.likes || 0);
        setIsLiked(data.isLiked || false);

        // iframe src 설정 (게임 URL 구성)
        if (data.gameUrl) {
          setIframeSrc(data.gameUrl);
        } else {
          // 기본 URL 구성
          setIframeSrc(`http://localhost:8080/${gameId}`);
        }

        setLoadError(false);
      } catch (error) {
        console.error("게임 메타데이터 로드 실패:", error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameMetadata();
  }, [gameId]);

  // iframe 메시지 수신 처리
  useEffect(() => {
    const handleIframeMessage = (event) => {
      const data = event.data;

      // error-report 메시지 처리
      if (
        data &&
        data.source === "alparka-game-iframe" &&
        data.type === "error-report"
      ) {
        const errorData = data.payload;
        console.error("🚨 IFRAME 오류 수신:", errorData);
      }

      // error-batch 메시지 처리
      if (
        data &&
        data.source === "alparka-game-iframe" &&
        data.type === "error-batch"
      ) {
        const batchData = data.payload;
        console.error("🚨 IFRAME 에러 배치 수신:", batchData);
      }
    };

    window.addEventListener("message", handleIframeMessage);

    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);

  // 핸들러
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleEdit = () => {
    // 게임 스튜디오로 이동
    navigate(`/studio/${gameId}`);
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
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
      window.alert("링크가 복사되었습니다!");
    } catch (err) {
      console.error("링크 복사 실패:", err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleFullscreen = () => {
    const iframe = gameFrameRef.current;
    if (!iframe) return;

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    } else {
      alert("전체화면을 지원하지 않는 브라우저입니다.");
    }
  };

  const handleRefresh = () => {
    setReloadToken((prev) => prev + 1);
    setIsLoading(true);
    setLoadError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <div className="game-play-page">
      <Header />

      <div className="play-container">
        {/* --- 1. 게임 화면 영역 --- */}
        <div className="game-screen-wrapper">
          <div className="game-header-bar">
            <div className="game-title">
              <span className="badge">{metadata?.category || "Arcade"}</span>
              <h2>{metadata?.game_title || "게임 로딩중..."}</h2>
            </div>
            <div className="game-controls">
              <button
                className="control-btn refresh-btn"
                onClick={handleRefresh}
                title="새로고침"
              >
                🔄
              </button>
              <button
                className="control-btn"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
              <button
                className="control-btn"
                onClick={handleCopyLink}
                title="링크 복사"
              >
                🔗
              </button>
              <button
                className="control-btn"
                onClick={handleFullscreen}
                title="전체 화면"
              >
                ⛶
              </button>
            </div>
          </div>

          <div className="iframe-container">
            {loadError && (
              <div className="error-overlay">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">게임을 불러올 수 없습니다</h3>
                <p className="error-message">
                  해당 게임이 존재하지 않거나 서버에서 제공하지 않습니다.
                </p>
                {iframeSrc && <p className="error-url">URL: {iframeSrc}</p>}
              </div>
            )}

            {isLoading && !loadError && (
              <div className="loading-overlay">로딩 중...</div>
            )}

            {iframeSrc && (
              <iframe
                key={reloadToken}
                ref={gameFrameRef}
                id="game-iframe"
                className="game-iframe"
                src={iframeSrc}
                title="Game Play"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                style={{
                  display: loadError ? "none" : "block",
                }}
              />
            )}
          </div>
        </div>

        {/* --- 2. 하단 정보 및 액션 바 --- */}
        <div className="game-action-bar">
          <div className="action-left">
            <div className="creator-profile">
              <div className="profile-img" />
              <div className="profile-info">
                <span className="creator-name">
                  {metadata?.author || "알파카 장인"}
                </span>
                <span className="upload-date">
                  {metadata?.created_at
                    ? new Date(metadata.created_at).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )
                    : new Date().toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                </span>
              </div>
            </div>
          </div>

          <div className="action-center">
            {/* 좋아요 버튼 */}
            <button
              className={`like-button ${isLiked ? "active" : ""}`}
              onClick={handleLike}
            >
              <span className="heart-icon">{isLiked ? "❤️" : "🤍"}</span>
              <span className="like-count">{likeCount}</span>
            </button>
          </div>

          <div className="action-right">
            {/* 수정하기 버튼 */}
            <button className="edit-button" onClick={handleEdit}>
              <span className="icon">🛠️</span>이 게임 리믹스하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
