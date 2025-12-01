// src/pages/Customize/Step2/CustomizeStep2.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import "./CustomizeStep2.css";

// 옵션 데이터 (컴포넌트 밖으로 이동하여 안정성 확보)
const optionsData = [
  {
    key: "weather",
    title: "날씨 변경: 비",
    desc: "“눈 내리는” → “비 내리는”",
    prompt: " 비 내리는 분위기로 변경해줘.",
    icon: "☔",
  },
  {
    key: "timeLimit",
    title: "긴장감 UP: 60초 제한",
    desc: "“제한시간 60초 추가해줘” 추가",
    prompt: " 제한시간 60초 룰을 추가해줘.",
    icon: "⌛",
  },
  {
    key: "control",
    title: "조작 단순화: 원버튼",
    desc: "“조작은 스페이스바 하나로만 하게 해줘” 추가",
    prompt: " 조작은 스페이스바 키 하나로만 가능하게 해줘.",
    icon: "🔘",
  },
  {
    key: "sound",
    title: "사운드: 신나는 BGM",
    desc: "“신나는 8비트 배경음악 넣어줘” 추가",
    prompt: " 신나는 8비트 배경음악을 넣어줘.",
    icon: "🎵",
  },
  {
    key: "difficulty",
    title: "난이도: 매운맛",
    desc: "“갈수록 엄청 어려워지게 해줘” 추가",
    prompt: " 갈수록 난이도가 엄청 어려워지게 해줘.",
    icon: "🔥",
  },
];

const CustomizeStep2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Step1에서 전달받은 기본 주문 내용
  const baseOrder =
    location.state?.order ||
    "눈 내리는 크리스마스 분위기로 두뇌를 자극하는 퍼즐 게임을 만들어줘.";

  // 화면에 표시될 텍스트 상태
  const [pText, setPText] = useState(baseOrder);

  // 재미 요소 옵션 선택 상태
  const [selectedOptions, setSelectedOptions] = useState({
    weather: false,
    difficulty: false,
    sound: false,
    control: false,
    timeLimit: false,
  });

  // ⭐ 핵심 기능: 옵션 선택이 바뀔 때마다 텍스트를 새로 조합합니다.
  useEffect(() => {
    let newText = baseOrder; // 항상 기본 주문서에서 시작

    // 켜져 있는 옵션들의 문구를 뒤에 이어 붙임
    optionsData.forEach((opt) => {
      if (selectedOptions[opt.key]) {
        newText += " " + opt.desc;
      }
    });

    setPText(newText); // 화면 업데이트
  }, [selectedOptions, baseOrder]);

  // 옵션 토글 핸들러
  const toggleOption = (key) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: !prev[key], // 켜져 있으면 끄고, 꺼져 있으면 켬
    }));
  };

  // 최종 생성 버튼 핸들러
  const handleCreate = () => {
    let finalPrompt = baseOrder;
    // 실제 AI에게 보낼 프롬프트 조합
    optionsData.forEach((opt) => {
      if (selectedOptions[opt.key]) {
        finalPrompt += opt.prompt;
      }
    });

    console.log("최종 프롬프트:", finalPrompt);
    navigate("/gamestudio", { state: { finalPrompt } });
  };

  const handleBack = () => {
    navigate("/customize/step1", { state: { order: baseOrder } });
  };

  return (
    <div className="customize-step2">
      <Header />
      
      <div className="step2-container">
        {/* --- 왼쪽 패널: 최종 주문서 --- */}
        <div className="left-panel">
          <div className="order-card">
            
            {/* 뒤로가기 버튼 */}
            <div className="back-btn-wrapper" onClick={handleBack}>
              <div className="polygon" />
            </div>

            <h1 className="panel-title">최종 주문서</h1>
            <h2 className="panel-subtitle">🤖 이렇게 만들면 될까요?</h2>

            <div className="order-display-area">
              <p className="order-text">{pText}</p>
            </div>
            
            <p className="warning-text">텍스트 수정은 이전 단계에서만 가능해요</p>

            {/* 생성 버튼 */}
            <div className="create-btn" onClick={handleCreate}>
              <div className="btn-text">CREATE!</div>
            </div>
          </div>
        </div>

        {/* --- 오른쪽 패널: 재미 요소 옵션 --- */}
        <div className="right-panel">
          <div className="options-card">
            <h2 className="panel-title-right">재미 요소 추가</h2>
            
            <div className="options-list">
              {optionsData.map((opt) => (
                <div
                  key={opt.key}
                  className="option-item"
                  onClick={() => toggleOption(opt.key)}
                >
                  <div className="option-bg" />
                  
                  <div className="option-content">
                    <div className="option-icon-box">
                      <span className="option-icon">{opt.icon}</span>
                    </div>
                    <div className="option-text-box">
                      <div className="option-title">{opt.title}</div>
                      <div className="option-desc">{opt.desc}</div>
                    </div>
                    {/* 선택 여부 체크 */}
                    <div className={`option-check ${selectedOptions[opt.key] ? "selected" : ""}`} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeStep2;