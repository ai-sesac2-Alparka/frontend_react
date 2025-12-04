import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { getShowcaseGames } from "../../api/arcade";
import "./HomeCreation.css";

function HomeCreation() {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [showcaseGames, setShowcaseGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // API에서 쇼케이스 게임 불러오기
  useEffect(() => {
    const fetchShowcaseGames = async () => {
      setLoading(true);
      try {
        const res = await getShowcaseGames(4);
        const gamesData = res.data.games || [];
        const processedGames = gamesData.map((game) => {
          let thumbnailUrl = game.thumbnail;
          if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
            thumbnailUrl = `${backendUrl}${thumbnailUrl}`;
          }
          // Add timestamp to prevent caching
          if (thumbnailUrl) {
            const separator = thumbnailUrl.includes("?") ? "&" : "?";
            thumbnailUrl = `${thumbnailUrl}${separator}t=${new Date().getTime()}`;
          }
          return {
            ...game,
            thumbnail: thumbnailUrl,
          };
        });
        setShowcaseGames(processedGames);
      } catch (error) {
        console.error("Failed to fetch showcase games:", error);
        // 에러 시 기본 더미 데이터 사용
        setShowcaseGames([
          {
            id: "showcase-1",
            game_title: "테트리스",
            thumbnail: "https://placehold.co/257x301",
            author: "Classic Games",
            category: "puzzle",
            plays: 50000,
          },
          {
            id: "showcase-2",
            game_title: "갤러그",
            thumbnail: "https://placehold.co/257x301",
            author: "Retro Games",
            category: "shooting",
            plays: 45000,
          },
          {
            id: "showcase-3",
            game_title: "지뢰 찾기",
            thumbnail: "https://placehold.co/257x301",
            author: "Puzzle Master",
            category: "puzzle",
            plays: 30000,
          },
          {
            id: "showcase-4",
            game_title: "점프맵",
            thumbnail: "https://placehold.co/257x301",
            author: "Action Dev",
            category: "action",
            plays: 25000,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseGames();
  }, [backendUrl]);

  // Fonts are loaded globally in src/index.js to avoid per-page timing issues

  // 스크롤 함수
  const scrollToGameCreator = () => {
    const element = document.getElementById("game-creator");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // 태그 선택
  const handleTagClick = (type, value) => {
    if (type === "genre") {
      setSelectedGenre(selectedGenre === value ? "" : value);
    } else {
      setSelectedMood(selectedMood === value ? "" : value);
    }
  };

  // CREATE 버튼
  const handleCreate = () => {
    // Allow proceeding even when no tags are selected. order may be empty.
    const orderText = [selectedMood, selectedGenre]
      .filter(Boolean)
      .join(" ")
      .trim();
    navigate("/customize/step1", {
      state: {
        order: orderText ? `${orderText} 게임` : "",
      },
    });
  };

  // 완성된 주문서 텍스트 계산 (둘 다 비어있으면 빈 문자열)
  const orderText = (() => {
    const parts = [selectedMood, selectedGenre]
      .filter(Boolean)
      .join(" ")
      .trim();
    return parts ? `${parts} 게임` : "";
  })();

  return (
    <div className="home-creation-page">
      <Header />

      <main className="main-content">
        {/* 히어로 섹션 */}
        <section className="hero-section">
          <div className="hero-logo">
            <img src="/images/alpaca.png" alt="AIparkA Logo" />
          </div>

          <h1 className="hero-title">당신의 손끝에서 만들어지는 세계</h1>

          <p className="hero-subtitle">
            머릿속 상상이 게임으로 뚝딱!️
            <br />
            AIparkA가 당신의 상상을 현실로 소환해 드립니다. 🧙‍♂️
          </p>

          <button className="btn-hero-cta" onClick={scrollToGameCreator}>
            ⚡지금 바로 시작하기
          </button>
        </section>

        {/* 게임 쇼케이스 */}
        <section className="game-showcase">
          <div className="game-showcase-grid">
            {loading ? (
              <div className="loading-message">게임을 불러오는 중...</div>
            ) : (
              showcaseGames.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => navigate(`/play/${game.id}`)}
                >
                  <div className="game-card-image">
                    <img src={game.thumbnail} alt={game.game_title} />
                  </div>
                  <div className="game-card-info">
                    <h3 className="game-card-title">{game.game_title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 게임 생성 섹션 */}
        <section id="game-creator" className="game-creator-section">
          <div className="section-title-wrapper">
            <img src="/images/congrats 1.png" alt="left" />
            <h2 className="section-title-creator">
              오늘은 어떤 게임을
              <br />
              만들어볼까요?
            </h2>
            <img
              src="/images/congrats 3.png"
              alt="right"
              className="congrats-right"
            />
          </div>

          <div className="creator-box">
            {/* 장르 선택 */}
            <div className="option-group">
              <h3 className="option-title">장르</h3>
              <div className="option-tags">
                {[
                  "🧠 두뇌 퍼즐",
                  "🏃 액션/런",
                  "👆 단순 클릭",
                  "🔫 슈팅",
                  "❓퀴즈",
                  "🏪 타이쿤",
                  "🛡️ 디펜스",
                  "🎵 리듬/음악",
                ].map((genre) => (
                  <button
                    key={genre}
                    className={`tag-btn ${
                      selectedGenre === genre ? "active" : ""
                    }`}
                    onClick={() => handleTagClick("genre", genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* 분위기 선택 */}
            <div className="option-group">
              <h3 className="option-title">분위기</h3>
              <div className="option-tags">
                {[
                  "🎄 크리스마스",
                  "🧟 좀비/호러",
                  "👾 레트로 픽셀",
                  "☔ 비오는 날",
                  "🐱 귀여운 동물",
                  "👔 직장인 공감",
                  "🌃 사이버펑크",
                  "🏰 판타지",
                ].map((mood) => (
                  <button
                    key={mood}
                    className={`tag-btn ${
                      selectedMood === mood ? "active" : ""
                    }`}
                    onClick={() => handleTagClick("mood", mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* 완성된 주문서 & CREATE 버튼 */}
            <div className="creator-footer">
              <div className="order-summary">
                <p className="order-label">완성된 주문서</p>
                <p className="order-text">{orderText}</p>
              </div>

              <button className="btn-create" onClick={handleCreate}>
                CREATE!
              </button>
            </div>
          </div>
        </section>

        {/* 명예의 전당 */}
        <section className="hall-of-fame">
          <div className="trophy-icon">🎖️</div>

          <h2 className="section-title-fame">명예의 전당</h2>

          <p className="hall-subtitle">최근 가장 인기 있었던 게임이에요!</p>

          <button className="btn-more" onClick={() => navigate("/arcade")}>
            더보기
          </button>

          <div className="fame-games-grid">
            {[
              {
                id: "sy_vampire_survivors",
                title: "좀비 서바이벌",
                author: "Studio SY",
                thumbnail: "/images/fame_vampire_surviviors.png",
              },
              {
                id: "es_music",
                title: "리듬 월드",
                author: "ES Lab",
                thumbnail: "/images/fame_rhythm_world.png",
              },
              {
                id: "sy_run_gen_img",
                title: "쿠키 점프",
                author: "Studio SY",
                thumbnail: "/images/fame_cookie_jump.png",
              },
              {
                id: "sy_ww2_shooting",
                title: "스카이 레이더스",
                author: "Studio SY",
                thumbnail: "/images/fame_sky_raiders.png",
              },
            ].map((game) => (
              <div
                key={game.id}
                className="fame-game-item"
                onClick={() => navigate(`/play/${game.id}`)}
              >
                <div className="fame-game-image">
                  <img src={game.thumbnail} alt={game.title} />
                </div>
                <div className="fame-game-info">
                  <h3 className="fame-game-title">{game.title}</h3>
                  <p className="fame-game-author">{game.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomeCreation;
