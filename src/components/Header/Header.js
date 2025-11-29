// components/Header/Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname || '';
    const activePath = path.startsWith('/arcade') ? 'arcade' : (path.startsWith('/home') ? 'create' : '');

    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo" onClick={() => navigate('/home')}>
                    <img src="/images/keyboard_logo.png" alt="Logo" className="logo-image" />
                </div>
                
                <div className="header-actions">
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
                    <button className="btn-signup">회원가입</button>
                    <button className="btn-login">로그인</button>
                </div>
            </div>
        </header>
    );
}

export default Header;