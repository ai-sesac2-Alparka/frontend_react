// src/pages/MyPage/MyPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserCreatedGames,
  getUserLikedGames,
  getUserRecentGames,
} from "../../api/arcade";
import "./MyPage.css";

// 프로필 이미지 (없으면 public/images/alpaca.png 사용)
const profileImage = "/images/alpaca.png";

const MyPage = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created"); // created, liked, recent
  // 사용자명 인라인 편집 상태
  const [userName, setUserName] = useState("알파카 장인");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  // user-bio will show number of created games by default; make editable
  const [userBio, setUserBio] = useState("");
  const [bioInput, setBioInput] = useState("");
  // profile image editable state (preview URL)
  const [profileImageUrl, setProfileImageUrl] = useState(profileImage);
  const hiddenFileInputRef = useRef(null);

  // 로그인 체크
  useEffect(() => {
    // 개발 중에는 백엔드 로그인 없이 페이지를 확인할 수 있도록 우회 옵션 제공
    // - 개발 모드일 때 자동 허용
    // - 또는 URL에 ?dev=true 쿼리 파라미터가 있으면 강제 허용
    const urlParams = new URLSearchParams(window.location.search);
    const devOverride = urlParams.get("dev") === "true";

    if (!isLoggedIn && !devOverride && process.env.NODE_ENV !== "development") {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const [games, setGames] = useState({
    created: [],
    liked: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // API에서 게임 목록 불러오기
  useEffect(() => {
    const fetchAllGames = async () => {
      setLoading(true);
      try {
        const [createdRes, likedRes, recentRes] = await Promise.all([
          getUserCreatedGames("sy"),
          getUserLikedGames("sy"),
          getUserRecentGames("sy"),
        ]);

        const processGames = (gamesData) => {
          return (gamesData || []).map((game) => ({
            ...game,
            thumbnail: game.thumbnail?.startsWith("http")
              ? game.thumbnail
              : `${backendUrl}${game.thumbnail}?t=${Date.now()}`,
          }));
        };

        setGames({
          created: processGames(createdRes.data.games),
          liked: processGames(likedRes.data.games),
          recent: processGames(recentRes.data.games),
        });
      } catch (error) {
        console.error("Failed to fetch user games:", error);
        // 에러 시 빈 배열 유지
      } finally {
        setLoading(false);
      }
    };

    fetchAllGames();
  }, [backendUrl]);

  // 초기 bio는 '만든 게임 수'로 설정
  useEffect(() => {
    setUserBio(`${games.created.length}개의 게임을 만들었습니다.`);
  }, [games.created.length]);

  return (
    <div className="mypage-container">
      {/* 1. 프로필 섹션 */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-image-wrapper">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="profile-image"
              onClick={() => {
                // 이미지 클릭 시 에디트 모드에서만 업로드 트리거
                if (isEditingName && hiddenFileInputRef.current) {
                  hiddenFileInputRef.current.click();
                }
              }}
            />
            <button
              className="edit-icon-btn"
              onClick={() => {
                // 편집 모드로 진입: 이름, 바이오, 이미지 프리셋 로드
                setNameInput(userName);
                setBioInput(userBio);
                setProfileImageUrl(profileImageUrl || profileImage);
                setIsEditingName(true);
              }}
              aria-label="Edit profile"
            >
              ✏️
            </button>
            {/* 숨겨진 파일 입력: 이미지 클릭으로 트리거됩니다 */}
            <input
              type="file"
              accept="image/*"
              ref={(el) => (hiddenFileInputRef.current = el)}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setProfileImageUrl(ev.target.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="profile-info">
            {isEditingName ? (
              <input
                className="user-name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            ) : (
              <h2 className="user-name">{userName}</h2>
            )}
            {/* user-bio: 기본은 만든 게임 수, 편집 가능 */}
            {isEditingName ? (
              <textarea
                className="user-bio-input"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="간단한 소개나 상태 메시지를 입력하세요"
                rows={2}
              />
            ) : (
              <p className="user-bio">{userBio}</p>
            )}
            {/* stat-label / stat-value 섹션 제거 (팔로워 확인 기능 제거 요청) */}
            {/* 이미지 업로드 입력은 편집 모드에서만 표시 */}
            {isEditingName && (
              <div className="image-edit-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setProfileImageUrl(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            )}

            <button
              className="btn-edit-profile"
              onClick={() => {
                if (isEditingName) {
                  // 저장 동작: 이름, 바이오, 이미지 모두 적용
                  setUserName(nameInput || userName);
                  setUserBio(bioInput || userBio);
                  // profileImageUrl already updated on file select
                  setIsEditingName(false);
                } else {
                  // 편집 모드로 진입
                  setNameInput(userName);
                  setBioInput(userBio);
                  setIsEditingName(true);
                }
              }}
            >
              {isEditingName ? "변경사항 저장" : "프로필 편집"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. 메인 콘텐츠 섹션 */}
      <section className="content-section">
        {/* 탭 메뉴 */}
        <div className="tab-menu">
          <button
            className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
            onClick={() => setActiveTab("created")}
          >
            🕹️ 내가 만든 게임
          </button>
          <button
            className={`tab-btn ${activeTab === "liked" ? "active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            💖 찜한 리스트
          </button>
          <button
            className={`tab-btn ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => setActiveTab("recent")}
          >
            🕒 최근 플레이
          </button>
        </div>

        {/* 게임 그리드 */}
        <div className="game-grid-container">
          <div className="section-header">
            <h3>
              {activeTab === "created" && "내가 만든 게임"}
              {activeTab === "liked" && "찜한 게임 리스트"}
              {activeTab === "recent" && "최근에 플레이한 게임"}
              <span className="count">({games[activeTab].length})</span>
            </h3>
            <button className="view-all-btn">모두 보기 ›</button>
          </div>

          <div className="game-grid">
            {loading ? (
              <div className="loading-message">게임 목록을 불러오는 중...</div>
            ) : games[activeTab].length > 0 ? (
              <>
                {games[activeTab].map((game) => (
                  <div
                    key={game.id}
                    className="game-card"
                    onClick={() => navigate(`/play/${game.id}`)}
                  >
                    <div className="card-thumbnail">
                      {game.thumbnail ? (
                        <img
                          src={game.thumbnail}
                          alt={game.game_title}
                          className="game-thumbnail-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      {/* 실제 이미지 대신 플레이스홀더 사용 (이미지가 없거나 로드 실패 시) */}
                      <div
                        className="thumbnail-placeholder"
                        style={{ display: game.thumbnail ? "none" : "flex" }}
                      >
                        {activeTab === "created" ? "🎮" : "👾"}
                      </div>
                    </div>
                    <div className="card-info">
                      <h4 className="card-title">{game.game_title}</h4>
                      <div className="card-meta">
                        <span>Arcade</span>
                        <span>⭐ 4.5</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* '만들기' 탭일 때 추가 버튼 표시 */}
                {activeTab === "created" && (
                  <div
                    className="game-card add-new"
                    onClick={() => navigate("/home")}
                  >
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
