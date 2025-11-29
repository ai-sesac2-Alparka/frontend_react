// src/pages/GameStudio/GameStudio.js

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "./GameStudio.css";

// 이미지 에셋 (필요시 경로 수정)
// NOTE: Using emojis for toolbar icons; remove unused image constants to avoid lint warnings.

const GameStudio = () => {
  const navigate = useNavigate();
  const gameFrameRef = useRef(null);
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState("game"); // game, assets, history, data
  const [gameTitle, setGameTitle] = useState("나만의 멋진 게임");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: "ai", text: "게임 생성이 완료되었습니다! 수정하고 싶은 내용이 있다면 말씀해주세요." }
  ]);
  const [isMuted, setIsMuted] = useState(false);
  // assets state: sample initial assets
  const [assets, setAssets] = useState([
    { id: 1, type: 'image', name: 'background', src: '/images/background.svg' },
    { id: 2, type: 'image', name: 'logo', src: '/images/logo.png' },
    { id: 3, type: 'audio', name: 'bgm', src: '' },
  ]);

  const [assetModal, setAssetModal] = useState({ open: false, asset: null });

  // 채팅 전송 핸들러
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // 사용자 메시지 추가
    const newMessages = [...chatMessages, { type: "user", text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");

    // AI 응답 시뮬레이션 (로딩 -> 응답)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: "ai", text: "네, 해당 내용을 수정하여 게임에 반영 중입니다... 🛠️" }]);
    }, 1000);
  };

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // 복사: iframe src를 우선으로, 없으면 현재 페이지 URL을 복사
  const handleCopyLink = async () => {
    const iframe = gameFrameRef.current;
    const link = iframe?.src || window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement('textarea');
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      window.alert('링크가 복사되었습니다.');
    } catch (err) {
      console.error('copy failed', err);
      window.alert('링크 복사에 실패했습니다.');
    }
  };

  // 전체화면 요청: iframe 요소에 대해 requestFullscreen 호출
  const handleFullscreen = () => {
    const iframe = gameFrameRef.current;
    if (!iframe) return;
    const el = iframe;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  // 에셋 모달 오픈
  const openAssetModal = (asset) => {
    setAssetModal({ open: true, asset });
  };

  const closeAssetModal = () => setAssetModal({ open: false, asset: null });

  // 파일 업로드 처리: 선택한 파일로 assets 배열 업데이트
  const handleAssetUpload = (file) => {
    if (!file || !assetModal.asset) return;
    const url = URL.createObjectURL(file);
    setAssets((prev) => prev.map(a => a.id === assetModal.asset.id ? { ...a, src: url, name: file.name } : a));
    // reflect to chat as user action
    const userNote = `에셋 '${assetModal.asset.name}'을(를) 업로드했습니다: ${file.name}`;
    setChatMessages(prev => [...prev, { type: 'user', text: userNote }]);
    setTimeout(() => setChatMessages(prev => [...prev, { type: 'ai', text: '에셋 업로드를 반영했습니다.' }]), 800);
    closeAssetModal();
  };

  // 프롬프트로 요구사항 입력 처리: 채팅창에 반영하고 간단 메시지로 처리
  const handleAssetPrompt = (promptText) => {
    if (!promptText) return;
    setChatMessages(prev => [...prev, { type: 'user', text: promptText }]);
    setTimeout(() => setChatMessages(prev => [...prev, { type: 'ai', text: '요구사항을 반영하여 에셋을 업데이트했습니다.' }]), 800);
    closeAssetModal();
  };

  return (
    <div className="game-studio">
      {/* --- 1. 상단 헤더 (제목, 저장, 업로드) --- */}
  <Header />
  <header className="studio-header">
        <div className="header-left">
          <input 
            type="text" 
            className="game-title-input" 
            value={gameTitle} 
            onChange={(e) => setGameTitle(e.target.value)}
          />
        </div>
        <div className="header-right">
          <button className="btn-secondary">변경 내용 저장</button>
          <button className="btn-primary" onClick={() => navigate('/arcade')}>
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
              <div className="game-container">
                {/* 게임 상단 툴바 */}
                <div className="game-toolbar">
                  <div className="toolbar-left">
                    <span className="status-dot">●</span> Running
                  </div>
                  <div className="toolbar-right">
                    <button className="tool-btn" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? "🔇" : "🔊"}
                    </button>
                    <button className="tool-btn" title="링크 복사" onClick={handleCopyLink}>🔗</button>
                    <button className="tool-btn" title="전체 화면" onClick={handleFullscreen}>⛶</button>
                  </div>
                </div>
                {/* 게임 Iframe (임시 URL) */}
                <iframe 
                  ref={gameFrameRef}
                  className="game-frame" 
                  src="https://e.widgetbot.io/channels/299881420642713600/555776561194762240" // 예시용 더미 URL
                  title="Game Preview"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                />
              </div>
            )}
            {activeTab === "assets" && (
              <div className="assets-panel">
                <div className="assets-grid">
                  {assets.map(asset => (
                    <div key={asset.id} className="asset-item" onClick={() => openAssetModal(asset)} role="button" tabIndex={0}>
                      <div className="asset-preview">
                        {asset.type === 'image' && asset.src ? (
                          <img src={asset.src} alt={asset.name} />
                        ) : asset.type === 'audio' ? (
                          <div className="audio-placeholder">🎵</div>
                        ) : (
                          <div className="asset-empty" />
                        )}
                      </div>
                      <div className="asset-name">{asset.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "history" && <div className="placeholder-panel">🕒 버전 히스토리 (준비 중)</div>}
            {activeTab === "data" && <div className="placeholder-panel">⚙️ 게임 설정 데이터 (준비 중)</div>}
          </div>
        </div>

        {/* --- 3. 오른쪽: 채팅 패널 --- */}
        <div className="chat-panel">
          <div className="chat-header">
            <h3>💬 AI 코딩 어시스턴트</h3>
          </div>
          
          <div className="chat-messages" style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/images/background.svg)`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: 'cover'
          }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <img src={`${process.env.PUBLIC_URL}/images/talking_alpaca.gif`} alt="alpaca" className="chat-alpaca" />

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="배경을 우주로 바꿔줘..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleEnterKey}
            />
            <button onClick={handleSendMessage}>전송</button>
          </div>
        </div>
      </div>
      {/* 에셋 업로드 / 프롬프트 modal */}
      {assetModal.open && (
        <div className="asset-modal-overlay" onClick={closeAssetModal}>
          <div className="asset-modal" onClick={(e)=>e.stopPropagation()}>
            <h3>에셋 수정: {assetModal.asset?.name}</h3>
            <div className="asset-modal-body">
              <div className="asset-modal-preview">
                {assetModal.asset?.type === 'image' && assetModal.asset?.src ? (
                  <img src={assetModal.asset.src} alt={assetModal.asset.name} />
                ) : assetModal.asset?.type === 'audio' ? (
                  <div className="audio-placeholder large">🎵 오디오</div>
                ) : (
                  <div className="asset-empty large" />
                )}
              </div>
              <div className="asset-modal-controls">
                <label className="upload-label">파일 선택
                  <input type="file" className="asset-file-input" onChange={(e)=>handleAssetUpload(e.target.files?.[0])} />
                </label>
                <div className="prompt-box">
                  <textarea placeholder="프롬프트 입력" className="asset-prompt" id="asset-prompt" />
                  <button className="btn-primary" onClick={() => {
                    const prompt = document.getElementById('asset-prompt')?.value;
                    handleAssetPrompt(prompt);
                  }}>적용</button>
                </div>
              </div>
            </div>
            <button className="asset-modal-close" onClick={closeAssetModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStudio;