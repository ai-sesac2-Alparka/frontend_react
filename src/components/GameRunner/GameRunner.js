import React, { useRef } from "react";
import PropTypes from "prop-types";
import "./GameRunner.css";

const GameRunner = ({ iframeSrc, isMuted, onToggleMute, onCopyLink, onFullscreen }) => {
  const gameFrameRef = useRef(null);

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

  return (
    <div className="game-container">
      <div className="game-toolbar">
        <div className="toolbar-left">
          <span className="status-dot">●</span> Running
        </div>
        <div className="toolbar-right">
          <button className="tool-btn" onClick={onToggleMute}>
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button className="tool-btn" title="링크 복사" onClick={handleCopy}>
            🔗
          </button>
          <button className="tool-btn" title="전체 화면" onClick={handleFullscreen}>
            ⛶
          </button>
        </div>
      </div>

      <iframe
        ref={gameFrameRef}
        className="game-frame"
        src={iframeSrc}
        title="Game Preview"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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
};

GameRunner.defaultProps = {
  iframeSrc: "https://e.widgetbot.io/channels/299881420642713600/555776561194762240",
  isMuted: false,
};

export default GameRunner;
