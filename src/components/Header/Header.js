// components/Header/Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn }) { // ⭐ isLoggedIn prop 추가
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname || '';
    
    // 현재 경로에 따라 활성화 버튼 결정
    const activePath = path.startsWith('/arcade') ? 'arcade' : (path.startsWith('/home') ? 'create' : '');

    return (
        <header className="header">
            <div className="header-inner">
                {/* 로고 클릭 시 홈으로 이동 */}
                <div className="logo" onClick={() => navigate('/home')}>
                    <img src="/images/keyboard_logo.png" alt="Logo" className="logo-image" />
                </div>
                
                <div className="header-actions">
                    {/* 네비게이션 버튼들 */}
                    <button
                        className={`btn-create-header ${activePath === 'create' ? 'active' : ''}`}
                        onClick={() => { navigate('/home'); }}
                    >
                        ✨만들기
                    </button>
                    <button
                        className={`btn-arcade-header ${activePath === 'arcade' ? 'active' : ''}`}
                        onClick={() => { navigate('/arcade'); }}
                    >
                        🕹️ 아케이드
                    </button>

                    {/* ⭐ 로그인 상태에 따른 조건부 렌더링 */}
                    {isLoggedIn ? (
                        <>
                            {/* 로그인 됨: 마이페이지 & 로그아웃 */}
                            <button 
                                className="mypage-btn" 
                                onClick={() => navigate('/mypage')}
                                title="마이페이지"
                            >
                                👤
                            </button>
                            <button 
                                className="btn-login" // 기존 스타일 재사용 혹은 btn-logout 클래스 추가 가능
                                onClick={() => {
                                    alert('로그아웃 되었습니다.');
                                    // 실제 로그아웃 로직 추가 필요 (예: setIsLoggedIn(false))
                                    navigate('/'); 
                                }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            {/* 로그인 안 됨: 회원가입 & 로그인 */}
                            <button className="btn-signup" onClick={() => navigate('/signup')}>
                                회원가입
                            </button>
                            <button className="btn-login" onClick={() => navigate('/login')}>
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