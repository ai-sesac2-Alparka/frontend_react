// src/App.js

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
import MyPage from "./pages/MyPage/MyPage";
import Arcade from "./pages/Arcade/Arcade";
import SignUp from "./pages/SignUp/SignUp"; // ✅ 회원가입 추가
import Login from "./pages/Login/Login"; // ✅ 로그인 추가

function App() {
  // 👇 현재는 "로그인 안 된 상태(false)"로 설정했습니다.
  // 나중에 로그인이 되면 이 값을 true로 바꾸게 됩니다.
  const [isLoggedIn] = useState(false);

  // 헤더를 포함하는 레이아웃 컴포넌트
  // (온보딩 페이지를 제외한 모든 페이지에서 헤더가 보입니다)
  const MainLayout = () => {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} />
        <Outlet /> {/* 여기에 각 페이지의 내용이 들어갑니다 */}
      </>
    );
  };

  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. 온보딩 페이지 (헤더 없음, 맨 처음 보이는 화면) */}
          <Route path="/" element={<Onboarding />} />

          {/* 2. 헤더가 필요한 페이지들 (MainLayout으로 감쌈) */}
          <Route element={<MainLayout />}>
            {/* 메인 및 아케이드 */}
            <Route path="/home" element={<HomeCreation />} />
            <Route path="/arcade" element={<Arcade />} />
            {/* 인증 관련 (로그인/회원가입) */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            {/* 게임 생성 프로세스 */}
            <Route path="/customize/step1" element={<CustomizeStep1 />} />
            <Route path="/customize/step2" element={<CustomizeStep2 />} />
            {/* 게임 스튜디오 및 플레이 */}
            <Route path="/studio" element={<GameStudio />} />
            <Route path="/gamestudio" element={<GameStudio />} />{" "}
            {/* 호환성용 */}
            <Route path="/play/:gameId" element={<GamePlay />} />
            {/* 마이페이지 */}
            <Route
              path="/mypage"
              element={<MyPage isLoggedIn={isLoggedIn} />}
            />
          </Route>

          {/* GameGenerating 페이지는 헤더를 숨기기 위해 MainLayout 밖으로 둡니다 */}
          <Route path="/game/generating" element={<GameGenerating />} />

          {/* 3. 잘못된 주소로 들어오면 온보딩('/')으로 되돌려보냄 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
