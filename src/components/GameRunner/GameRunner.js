import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./GameRunner.css";

const GameRunner = ({
  iframeSrc,
  isMuted,
  onToggleMute,
  onCopyLink,
  onFullscreen,
  reloadToken = 0,
  onErrorBatch = null,
  onRefresh = null,
}) => {
  const gameFrameRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // reloadToken이 변경되면 에러 상태 초기화
  useEffect(() => {
    setLoadError(false);
    setIsLoading(true);
  }, [reloadToken, iframeSrc]);

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

        if (typeof onErrorBatch === "function") {
          onErrorBatch(batchData);
        }
      }
    };

    window.addEventListener("message", handleIframeMessage);

    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, [onErrorBatch]);

  // 부모에서 전달된 핸들러로 동일 동작 유지
  const handleCopy = async () => {
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

    if (onCopyLink) onCopyLink(link);
  };

  const handleFullscreen = () => {
    const iframe = gameFrameRef.current;
    if (!iframe) return;
    const el = iframe;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();

    if (onFullscreen) onFullscreen();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
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

      <iframe
        key={reloadToken}
        ref={gameFrameRef}
        className="game-frame"
        src={iframeSrc}
        title="Game Preview"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        style={{
          display: loadError ? "none" : "block",
        }}
      />
    </div>
  );
};

GameRunner.propTypes = {
  iframeSrc: PropTypes.string,
  isMuted: PropTypes.bool,
  onToggleMute: PropTypes.func,
  onCopyLink: PropTypes.func,
  onFullscreen: PropTypes.func,
  reloadToken: PropTypes.number,
  onErrorBatch: PropTypes.func,
  onRefresh: PropTypes.func,
};

GameRunner.defaultProps = {
  iframeSrc: "http://localhost:8080/",
  isMuted: false,
  reloadToken: 0,
  onErrorBatch: null,
  onRefresh: null,
};

export default GameRunner;
