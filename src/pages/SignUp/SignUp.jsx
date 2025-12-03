// src/pages/SignUp/SignUp.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../../components/Header/Header"; // 헤더 필요 시 주석 해제
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.nickname) {
      setError("모든 정보를 입력해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    // TODO: 백엔드 회원가입 요청
    console.log("회원가입 요청:", formData);
    alert("회원가입이 완료되었습니다! 🎉");
    navigate("/");
  };

  // 소셜 로그인 핸들러 (임시)
  const handleSocialLogin = (provider) => {
    alert(`${provider} 간편가입 기능을 준비 중입니다!`);
    // 실제로는 여기서 백엔드 OAuth 주소로 리다이렉트합니다.
    // window.location.href = `http://localhost:8080/auth/${provider}`;
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <h1 className="signup-title">회원가입</h1>
          <p className="signup-subtitle">알파카 월드에 오신 것을 환영해요!</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>이메일 (아이디)</label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>닉네임</label>
              <input
                type="text"
                name="nickname"
                placeholder="멋진 이름을 지어주세요"
                value={formData.nickname}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                placeholder="비밀번호 입력"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="비밀번호 재입력"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-btn">
              가입완료
            </button>
          </form>

          {/* ⭐ 1. 간편가입 섹션 추가 */}
          <div className="social-login-section">
            <div className="divider">
              <span>또는 간편하게 시작하기</span>
            </div>
            
            <div className="social-buttons">
              <button 
                className="social-btn btn-google" 
                onClick={() => handleSocialLogin('google')}
              >
                <span className="social-icon">G</span> 구글로 시작하기
              </button>
              
              <button 
                className="social-btn btn-kakao" 
                onClick={() => handleSocialLogin('kakao')}
              >
                <span className="social-icon">K</span> 카카오로 시작하기
              </button>
              
              <button 
                className="social-btn btn-naver" 
                onClick={() => handleSocialLogin('naver')}
              >
                <span className="social-icon">N</span> 네이버로 시작하기
              </button>
            </div>
          </div>

          <p className="login-link">
            이미 계정이 있으신가요? <span onClick={() => navigate("/login")}>로그인하기</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;