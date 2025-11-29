import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Onboarding from './pages/Onboarding/Onboarding';
import HomeCreation from './pages/HomeCreation/HomeCreation';  // ⭐ 추가
import ElementArcade from './pages/Arcade/Arcade';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 온보딩 페이지 */}
        <Route path="/" element={<Onboarding />} />
        
        {/* 홈 페이지 */}
        <Route path="/home" element={<HomeCreation />} />  {/* ⭐ 추가 */}
        
        {/* 플레이 페이지 (임시) */}
        <Route path="/play/:id" element={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            background: '#7C3AED',
            color: 'white',
            fontSize: '24px'
          }}>
            <h1>🎮 게임 플레이 페이지 (준비 중)</h1>
          </div>
        } />
        
  {/* 아케이드 페이지 */}
  <Route path="/arcade" element={<ElementArcade />} />
        
        {/* 커스터마이즈 페이지 (임시) */}
        <Route path="/customize" element={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            background: '#7C3AED',
            color: 'white',
            fontSize: '24px'
          }}>
            <h1>✏️ 커스터마이즈 페이지 (준비 중)</h1>
          </div>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;