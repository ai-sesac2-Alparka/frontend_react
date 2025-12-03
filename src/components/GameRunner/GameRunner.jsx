import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./GameRunner.css";

const GameRunner = ({
  projectId,
  isMuted,
  onToggleMute,
  onCopyLink,
  onFullscreen,
  reloadToken = 0,
  onErrorBatch = null,
  onRefresh = null,
}) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setIsLoading(false);
  }, [reloadToken, projectId]);

  // 부모에서 전달된 핸들러로 동일 동작 유지
  const handleCopy = async () => {
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
      window.alert("링크가 복사되었습니다.");
    } catch (err) {
      console.error("copy failed", err);
    }

    if (onCopyLink) onCopyLink(link);
  };

  const handleFullscreen = () => {
    const el = canvasRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    if (onFullscreen) onFullscreen();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // 기본 동작: iframe 새로고침
      const iframe = gameFrameRef.current;
      if (iframe) {
        setIsLoading(true);
        setLoadError(false);
        const currentSrc = iframe.src;
        iframe.src = currentSrc;
      }
    }
  };

  return (
    <div className="game-container">
      <div className="game-toolbar">
        <div className="toolbar-left">
          <button
            className="tool-btn refresh-btn"
            onClick={handleRefresh}
            title="새로고침"
          >
            🔄
          </button>
        </div>
        <div className="toolbar-right">
          <button className="tool-btn" onClick={onToggleMute}>
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button className="tool-btn" title="링크 복사" onClick={handleCopy}>
            🔗
          </button>
          <button
            className="tool-btn"
            title="전체 화면"
            onClick={handleFullscreen}
          >
            ⛶
          </button>
        </div>
      </div>

      {loadError && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f5f5",
            zIndex: 10,
            padding: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
            게임을 불러올 수 없습니다
          </h3>
          <p style={{ margin: 0, color: "#666" }}>
            해당 게임이 존재하지 않거나 서버에서 제공하지 않습니다.
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: 14, color: "#999" }}>
            URL: {iframeSrc}
          </p>
        </div>
      )}

      {isLoading && !loadError && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#000",
            zIndex: 5,
            color: "#fff",
          }}
        >
          로딩 중...
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="game-frame"
        aria-label="game-canvas"
        style={{ background: "#0b0b0b", color: "#fff" }}
      />
      <div className="game-overlay">
        <div style={{ color: "#fff", fontSize: 14 }}>
          projectId: {projectId || "없음"} — 프리뷰는 추후 엔진 연동 예정
        </div>
      </div>
    </div>
  );
};

GameRunner.propTypes = {
  projectId: PropTypes.string,
  isMuted: PropTypes.bool,
  onToggleMute: PropTypes.func,
  onCopyLink: PropTypes.func,
  onFullscreen: PropTypes.func,
  reloadToken: PropTypes.number,
  onErrorBatch: PropTypes.func,
  onRefresh: PropTypes.func,
};

GameRunner.defaultProps = {
  projectId: "",
  isMuted: false,
  reloadToken: 0,
  onErrorBatch: null,
  onRefresh: null,
};

export default GameRunner;
