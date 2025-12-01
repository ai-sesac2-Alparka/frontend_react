import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

function Onboarding() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('🎮 온보딩 페이지 로드!');
        
        // 3초 후 홈으로 자동 이동
        const timer = setTimeout(() => {
            console.log('→ 홈으로 이동!');
            navigate('/home');
        }, 3000);

        // 컴포넌트 언마운트 시 타이머 정리
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="onboarding-container">
            <div className="logo-wrapper">
                <img 
                    src="/images/logo.png" 
                    alt="AIparkA" 
                    className="logo-image" 
                />
            </div>
            {/* loading indicator removed per design request */}
        </div>
    );
}

export default Onboarding;