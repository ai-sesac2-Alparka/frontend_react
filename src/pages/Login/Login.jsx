// src/pages/Login/Login.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../../components/Header/Header"; // 헤더 필요 시 주석 해제
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 간단한 유효성 검사
    if (!formData.email || !formData.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    
    // TODO: 백엔드 로그인 API 호출
    console.log("로그인 시도:", formData);
    
    // 임시: 로그인 성공 처리
    alert(`환영합니다! ${formData.email}님 👋`);
    navigate("/home"); // 로그인 후 홈으로 이동
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = (provider) => {
    alert(`${provider} 계정으로 로그인합니다.`);
    // window.location.href = `...`; 
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">오늘도 알파카 월드에서 즐거운 시간 보내세요!</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              로그인
            </button>
          </form>

          {/* 간편 로그인 섹션 */}
          <div className="social-login-section">
            <div className="divider">
              <span>또는 간편하게 로그인</span>
            </div>
            
            <div className="social-buttons">
              <button 
                className="social-btn btn-google" 
                onClick={() => handleSocialLogin('google')}
              >
                <span className="social-icon">G</span> 구글로 계속하기
              </button>
              
              <button 
                className="social-btn btn-kakao" 
                onClick={() => handleSocialLogin('kakao')}
              >
                <span className="social-icon">K</span> 카카오로 계속하기
              </button>
              
              <button 
                className="social-btn btn-naver" 
                onClick={() => handleSocialLogin('naver')}
              >
                <span className="social-icon">N</span> 네이버로 계속하기
              </button>
            </div>
          </div>

          <p className="signup-link">
            아직 계정이 없으신가요? <span onClick={() => navigate("/signup")}>회원가입하기</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;