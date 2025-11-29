import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header'; // 기존 헤더 컴포넌트 임포트
import './Arcade.css';

// 이미지 에셋 (없을 경우를 대비해 텍스트/이모지로 대체 가능하도록 구조화)
// 실제 프로젝트에서는 import 구문을 사용해 이미지를 불러오세요.
const assets = {
  filterIcon: '/images/filter-alt.svg', // public 폴더 기준 예시
  fireEmoji: '🔥',
  starIcon: '⭐'
};

// 더미 데이터: 카테고리
const CATEGORIES = [
  { id: 'all', name: '전체 보기', icon: '🕹️' },
  { id: 'action', name: '액션/런', icon: '🏃' },
  { id: 'click', name: '단순 클릭', icon: '👆' },
  { id: 'shooting', name: '슈팅', icon: '🔫' },
  { id: 'quiz', name: '퀴즈', icon: '❓' },
  { id: 'tycoon', name: '타이쿤', icon: '🏪' },
  { id: 'defense', name: '디펜스', icon: '🛡️' },
  { id: 'music', name: '리듬/음악', icon: '🎵' },
  { id: 'puzzle', name: '두뇌 퍼즐', icon: '🧠' },
];

// 더미 데이터: 게임 목록
const DUMMY_GAMES = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `게임 이름 ${i + 1}`,
  author: `Creator ${i + 1}`,
  category: ['action', 'click', 'shooting', 'quiz', 'tycoon', 'defense', 'music', 'puzzle'][i % 8],
  plays: '1.2k',
  thumbnail: '#bbbbbb' // 임시 배경색
}));

// 1등 게임 데이터
const TREND_GAME = {
  id: 0,
  title: '마그마 점프',
  author: 'LavaBoy',
  plays: '1.2M',
  description: '전 세계 크리에이터들이 만든 기상천외한 게임들을 플레이해보세요.',
  category: 'action'
};

const Arcade = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [games] = useState(DUMMY_GAMES);
  const [filteredGames, setFilteredGames] = useState(DUMMY_GAMES);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // 카테고리 필터링 로직
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(game => game.category === selectedCategory));
    }
  }, [selectedCategory, games]);

  const handleGameClick = (gameId) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div className="arcade-page">
      {/* 1. 상단바 (Global Header) */}
      <Header />

      {/* 2. 트렌드 배너 — 헤더 바로 아래 풀 폭 배치 */}
      <section className="trend-banner full-width">
        <div className="trend-info">
          <div className="trend-badge">
            <span className="badge-text">HOT TREND</span>
          </div>
          <h1 className="trend-title">이런 게임은<br />어떠신가요?</h1>
          <p className="trend-desc">{TREND_GAME.description}</p>
        </div>
        <div className="trend-action">
          <div className="trend-game-meta trend-meta--wide">
            <div className="fire-icon-box">
              <span className="fire-emoji">{assets.fireEmoji}</span>
            </div>
            <div className="meta-text meta-text--stacked">
              <h3 className="game-title">{TREND_GAME.title}</h3>
              <span className="game-author">by {TREND_GAME.author} • 플레이 {TREND_GAME.plays}</span>
              <div className="meta-cta">
                <button className="play-now-btn" onClick={() => navigate(`/play/${TREND_GAME.id}`)}>지금 플레이</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="arcade-content-container">
        {/* 3. 사이드바 (카테고리 필터) */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <button className="category-toggle-btn" onClick={() => setIsCategoryOpen(o => !o)}>
              {/* sidebar-title shows emoji + current category name (including 전체 보기) */}
              <span className="sidebar-title">{`🔗 ${CATEGORIES.find(c => c.id === selectedCategory)?.name || '카테고리'}`}</span>
            </button>
          </div>

          <div className={`category-list ${isCategoryOpen ? 'open' : ''}`}>
            <div className="category-items">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedCategory(cat.id); setIsCategoryOpen(false); }}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 4. 메인 콘텐츠 (배너 + 게임 리스트) */}
        <main className="main-content">
          
          {/* Duplicate inline trend-banner removed; top full-width banner is used instead */}

          {/* 게임 리스트 헤더 */}
          <div className="games-header">
            <h2 className="section-title">모든 게임</h2>
          </div>

          {/* 게임 그리드 (3열) */}
          <section className="games-grid">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <div 
                  key={game.id} 
                  className="game-card"
                  onClick={() => handleGameClick(game.id)}
                >
                  <div className="game-thumbnail" style={{ backgroundColor: game.thumbnail }} />
                  <div className="game-info">
                    <h3 className="card-title">{game.title}</h3>
                    <div className="card-meta">
                      <div className="rating-dots">
                        {/* 디자인에 있는 점 3개 (난이도나 평점 표현) */}
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">해당 카테고리의 게임이 없습니다.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Arcade;