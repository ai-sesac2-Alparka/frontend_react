// src/components/Header/Header.js

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css'; // 스타일 파일 연결

function Header({ isLoggedIn }) {
  const navigate = useNavigate(); // 페이지 이동을 도와주는 훅
  const location = useLocation(); // 현재 주소 정보를 가져오는 훅
  
  // 현재 경로(path) 가져오기
  const path = location.pathname || '';

  // 🎨 현재 페이지에 따라 버튼 스타일 활성화 (Active) 로직
  // '/arcade'로 시작하면 아케이드 버튼 활성화
  // '/home', '/customize', '/game' 등으로 시작하면 만들기 버튼 활성화
  let activePath = '';
  if (path.startsWith('/arcade')) {
    activePath = 'arcade';
  } else if (path.startsWith('/home') || path.startsWith('/customize') || path.startsWith('/game')) {
    activePath = 'create';
  }

  return (
    <header className="header">
      <div className="header-inner">
        {/* 1. 로고 (클릭 시 홈으로) */}
        <div className="logo" onClick={() => navigate('/home')}>
          {/* 이미지가 없으면 텍스트가 대신 보입니다 */}
          <img 
            src="/images/keyboard_logo.png" 
            alt="Logo" 
            className="logo-image" 
            onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText = '👾 MY GAME';}} 
          />
        </div>

        <div className="header-actions">
          {/* 2. 메인 네비게이션 */}
          <button
            className={`btn-create-header ${activePath === 'create' ? 'active' : ''}`}
            onClick={() => navigate('/home')}
          >
            ✨ 만들기
          </button>
          <button
            className={`btn-arcade-header ${activePath === 'arcade' ? 'active' : ''}`}
            onClick={() => navigate('/arcade')}
          >
            🕹️ 아케이드
          </button>

          {/* 구분선 (선택사항) */}
          <div style={{ width: '1px', height: '20px', background: '#e0e0e0', margin: '0 5px' }}></div>

          {/* 3. 로그인 상태에 따른 버튼 분기 */}
          {isLoggedIn ? (
            /* ✅ 로그인 상태일 때 보여줄 버튼들 */
            <>
              <button 
                className="mypage-btn" 
                onClick={() => navigate('/mypage')}
                title="마이페이지"
              >
                👤
              </button>
              <button 
                className="btn-login" // 스타일 재사용
                onClick={() => {
                  alert('로그아웃 되었습니다.');
                  // 실제로는 여기서 로그아웃 처리 함수를 호출해야 함
                  navigate('/'); 
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            /* ❌ 비로그인 상태일 때 보여줄 버튼들 */
            <>
              <button 
                className="btn-signup" 
                onClick={() => navigate('/signup')}
              >
                회원가입
              </button>
              <button 
                className="btn-login" 
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;