// src/pages/MyPage/MyPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

// 프로필 이미지 (없으면 public/images/alpaca.png 사용)
const profileImage = "/images/alpaca.png";

const MyPage = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created"); // created, liked, recent

  // 로그인 체크
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // 더미 데이터 생성기
  const generateDummyGames = (count, type) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      title: `${type === 'created' ? '나의' : type === 'liked' ? '찜한' : '최근'} 게임 ${i + 1}`,
      image: `https://via.placeholder.com/150/7C3AED/FFFFFF?text=Game+${i + 1}`, // 임시 이미지
      type: type
    }));
  };

  // 탭별 데이터
  const games = {
    created: generateDummyGames(5, 'created'),
    liked: generateDummyGames(8, 'liked'),
    recent: generateDummyGames(3, 'recent')
  };

  return (
    <div className="mypage-container">
      {/* 1. 프로필 섹션 */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-image-wrapper">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <button className="edit-icon-btn">✏️</button>
          </div>
          <div className="profile-info">
            <h2 className="user-name">알파카 장인</h2>
            <p className="user-bio">"오늘도 코딩하는 알파카입니다."</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">만든 게임</span>
                <span className="stat-value">5</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">팔로워</span>
                <span className="stat-value">128</span>
              </div>
            </div>
            <button className="btn-edit-profile">정보 수정</button>
          </div>
        </div>
      </section>

      {/* 2. 메인 콘텐츠 섹션 */}
      <section className="content-section">
        {/* 탭 메뉴 */}
        <div className="tab-menu">
          <button 
            className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            🕹️ 내가 만든 게임
          </button>
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            💖 찜한 리스트
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            🕒 최근 플레이
          </button>
        </div>

        {/* 게임 그리드 */}
        <div className="game-grid-container">
          <div className="section-header">
            <h3>
              {activeTab === 'created' && "내가 만든 게임"}
              {activeTab === 'liked' && "찜한 게임 리스트"}
              {activeTab === 'recent' && "최근에 플레이한 게임"}
              <span className="count">({games[activeTab].length})</span>
            </h3>
            <button className="view-all-btn">모두 보기 ›</button>
          </div>

          <div className="game-grid">
            {games[activeTab].length > 0 ? (
              <>
                {games[activeTab].map((game) => (
                  <div key={game.id} className="game-card" onClick={() => navigate(`/play/${game.id}`)}>
                    <div className="card-thumbnail">
                      {/* 실제 이미지 대신 플레이스홀더 사용 */}
                      <div className="thumbnail-placeholder">{game.type === 'created' ? '🎮' : '👾'}</div>
                    </div>
                    <div className="card-info">
                      <h4 className="card-title">{game.title}</h4>
                      <div className="card-meta">
                        <span>Arcade</span>
                        <span>⭐ 4.5</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* '만들기' 탭일 때 추가 버튼 표시 */}
                {activeTab === 'created' && (
                  <div className="game-card add-new" onClick={() => navigate('/home')}>
                    <div className="add-icon">+</div>
                    <p>새로운 게임 만들기</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>아직 게임이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyPage;