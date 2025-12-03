// src/pages/GamePlay/GamePlay.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header"; // 기존 헤더 컴포넌트 재사용
import "./GamePlay.css";

// 이미지 에셋 (필요시 경로 수정)
// import iconHeartOn from "../../assets/images/heart_on.png";
// import iconHeartOff from "../../assets/images/heart_off.png";

const GamePlay = () => {
  const navigate = useNavigate();
  // URL에서 게임 ID를 사용하지 않으므로 useParams 호출은 제거했습니다.

  // 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(128); // 더미 데이터
  const [isMuted, setIsMuted] = useState(false);

  // 핸들러
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleEdit = () => {
    // 게임 스튜디오로 이동 (현재 게임 ID 전달)
    navigate(`/studio`); 
  };

  const handleCopyLink = () => {
    alert("게임 링크가 복사되었습니다!");
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById("game-iframe");
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else {
      alert("전체화면을 지원하지 않는 브라우저입니다.");
    }
  };

  return (
    <div className="game-play-page">
      <Header />
      
      <div className="play-container">
        {/* --- 1. 게임 화면 영역 --- */}
        <div className="game-screen-wrapper">
            <div className="game-header-bar">
                <div className="game-title">
                    <span className="badge">Arcade</span>
                    <h2>눈 내리는 크리스마스 퍼즐</h2>
                </div>
                <div className="game-controls">
                    <button className="control-btn" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? "🔇" : "🔊"}
                    </button>
                    <button className="control-btn" onClick={handleCopyLink} title="링크 복사">
                        🔗
                    </button>
                    <button className="control-btn" onClick={handleFullscreen} title="전체 화면">
                        ⛶
                    </button>
                </div>
            </div>

            <div className="iframe-container">
                <iframe 
                  id="game-iframe"
                  className="game-iframe" 
                  src="https://e.widgetbot.io/channels/299881420642713600/555776561194762240" // 더미 URL
                  title="Game Play"
                  allow="fullscreen"
                />
            </div>
        </div>

        {/* --- 2. 하단 정보 및 액션 바 --- */}
        <div className="game-action-bar">
            <div className="action-left">
                <div className="creator-profile">
                    <div className="profile-img" />
                    <div className="profile-info">
                        <span className="creator-name">알파카 장인</span>
                        <span className="upload-date">2024. 12. 25</span>
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
                    <span className="icon">🛠️</span>
                    이 게임 리믹스하기
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;