import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header/Header";

// Contexts
import { GameProvider } from "./contexts/GameContext";

// Pages
import Onboarding from "./pages/Onboarding/Onboarding";
import HomeCreation from "./pages/HomeCreation/HomeCreation";
import CustomizeStep1 from "./pages/Customize/Step1/CustomizeStep1";
import CustomizeStep2 from "./pages/Customize/Step2/CustomizeStep2";
import GameGenerating from "./pages/GameGenerating/GameGenerating";
import GameStudio from "./pages/GameStudio/GameStudio";
import GamePlay from "./pages/GamePlay/GamePlay";
import MyPage from "./pages/MyPage/MyPage"; // ⭐ MyPage 추가
import Arcade from "./pages/Arcade/Arcade";

function App() {
  // 👇 여기를 true로 하면 "로그인 된 상태" (마이페이지 접근 가능)
  // 👇 여기를 false로 하면 "로그인 안 된 상태" (마이페이지 접근 불가, 로그인 버튼 보임)
  const [isLoggedIn] = useState(true);

  // 헤더를 포함하는 레이아웃 컴포넌트 (온보딩 제외 모든 페이지용)
  const MainLayout = () => {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} />
        <Outlet /> {/* 각 페이지 컴포넌트가 여기에 렌더링됩니다 */}
      </>
    );
  };

  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. 온보딩 페이지 (헤더 없음) */}
          <Route path="/" element={<Onboarding />} />

          {/* 2. 헤더가 필요한 페이지들 (MainLayout으로 감쌈) */}
          <Route element={<MainLayout />}>
            {/* 홈 페이지 */}
            <Route path="/home" element={<HomeCreation />} />

            {/* 아케이드 페이지 */}
            <Route path="/arcade" element={<Arcade />} />

            {/* 5-1. 템플릿 수정_1 (주문서 작성) */}
            <Route path="/customize/step1" element={<CustomizeStep1 />} />

            {/* 5-2. 템플릿 수정_2 (최종 확인) */}
            <Route path="/customize/step2" element={<CustomizeStep2 />} />

            {/* 6. 게임 생성 중 (로딩 페이지) */}
            <Route path="/game/generating" element={<GameGenerating />} />

            {/* 7. 게임 스튜디오 */}
            <Route path="/studio" element={<GameStudio />} />
            {/* 호환성을 위한 추가 경로 */}
            <Route path="/gamestudio" element={<GameStudio />} />

            {/* 8. 플레이 페이지 */}
            <Route path="/play/:id" element={<GamePlay />} />

            {/* 9. 마이페이지 (로그인 상태 전달) */}
            <Route
              path="/mypage"
              element={<MyPage isLoggedIn={isLoggedIn} />}
            />
          </Route>

          {/* 404 - 잘못된 경로는 온보딩으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
