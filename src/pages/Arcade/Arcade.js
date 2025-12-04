import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../../components/Header/Header"; // 기존 헤더 컴포넌트 임포트
import { getArcadeGames, getTrendingGame } from "../../api/arcade";
import "./Arcade.css";

// 더미 데이터: 카테고리
const CATEGORIES = [
  { id: "all", name: "전체 보기", icon: "🕹️" },
  { id: "action", name: "액션/런", icon: "🏃" },
  { id: "click", name: "단순 클릭", icon: "👆" },
  { id: "shooting", name: "슈팅", icon: "🔫" },
  { id: "quiz", name: "퀴즈", icon: "❓" },
  { id: "tycoon", name: "타이쿤", icon: "🏪" },
  { id: "defense", name: "디펜스", icon: "🛡️" },
  { id: "music", name: "리듬/음악", icon: "🎵" },
  { id: "puzzle", name: "두뇌 퍼즐", icon: "🧠" },
  { id: "etc", name: "기타", icon: "�" },
];

// 더미 데이터: 게임 목록
const DUMMY_GAMES = Array.from({ length: 12 }).map((_, i) => ({
  id: `game-${i + 1}`,
  game_title: `게임 이름 ${i + 1}`,
  author: `Creator ${i + 1}`,
  category: [
    "action",
    "click",
    "shooting",
    "quiz",
    "tycoon",
    "defense",
    "music",
    "puzzle",
    "etc",
  ][i % 8],
  plays: 1200,
  thumbnail: "#bbbbbb", // 임시 배경색
}));

// 1등 게임 데이터
const TREND_GAME = {
  id: "game-trend-1",
  game_title: "마그마 점프",
  author: "LavaBoy",
  plays: 1200000,
  description:
    "전 세계 크리에이터들이 만든 기상천외한 게임들을 플레이해보세요.",
  category: "action",
};

const Arcade = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [games, setGames] = useState([]);
  const [trendGame, setTrendGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // API에서 게임 목록 불러오기
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const [gamesRes, trendRes] = await Promise.all([
          getArcadeGames(selectedCategory),
          getTrendingGame(),
        ]);

        const gamesData = gamesRes.data.games || [];
        const processedGames = gamesData.map((game) => ({
          ...game,
          thumbnail: game.thumbnail?.startsWith("http")
            ? game.thumbnail
            : `${backendUrl}${game.thumbnail}?t=${Date.now()}`,
        }));

        setGames(processedGames);

        if (trendRes.data.game) {
          const trendData = trendRes.data.game;
          setTrendGame({
            ...trendData,
            thumbnail: trendData.thumbnail?.startsWith("http")
              ? trendData.thumbnail
              : `${backendUrl}${trendData.thumbnail}?t=${Date.now()}`,
          });
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
        // 에러 시 더미 데이터 사용
        setGames(DUMMY_GAMES);
        setTrendGame(TREND_GAME);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedCategory, backendUrl]);

  const handleGameClick = (gameId) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div className="arcade-page">
      {/* 1. 상단바 (Global Header) - Removed as it is provided by MainLayout */}
      {/* 2. 트렌드 배너 — 헤더 바로 아래 풀 폭 배치 */}
      <section className="trend-banner full-width">
        <div className="trend-info">
          <div className="trend-badge" />
          <h1 className="trend-title">
            HOT🔥
            <br />
            TREND
          </h1>
          <p className="trend-desc">
            {trendGame?.description || TREND_GAME.description}
          </p>
        </div>
        {/* trend-action removed per request */}
      </section>{" "}
      <div className="arcade-content-container">
        {/* 3. 사이드바 (카테고리 필터) */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <button
              className="category-toggle-btn"
              onClick={() => setIsCategoryOpen((o) => !o)}
            >
              {/* sidebar-title shows emoji + current category name (including 전체 보기) */}
              <span className="sidebar-title">{`🔗 ${
                CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
                "카테고리"
              }`}</span>
            </button>
          </div>

          <div className={`category-list ${isCategoryOpen ? "open" : ""}`}>
            <div className="category-items">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-item ${
                    selectedCategory === cat.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsCategoryOpen(false);
                  }}
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
            {loading ? (
              <div className="loading-message">게임 목록을 불러오는 중...</div>
            ) : games.length > 0 ? (
              games.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => handleGameClick(game.id)}
                >
                  <div className="game-thumbnail">
                    {game.thumbnail?.startsWith("#") ? (
                      <div
                        style={{
                          backgroundColor: game.thumbnail,
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    ) : (
                      <img
                        src={game.thumbnail}
                        alt={game.game_title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div className="game-info">
                    <h3 className="card-title">{game.game_title}</h3>
                    <div className="card-meta" />
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
