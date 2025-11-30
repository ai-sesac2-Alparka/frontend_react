// pages/Customize/Step2/CustomizeStep2.js

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import "./CustomizeStep2.css";

const CustomizeStep2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Step1에서 전달받은 주문 내용 (없을 경우 기본값)
  const baseOrder = location.state?.order || "눈 내리는 크리스마스 분위기로 두뇌를 자극하는 퍼즐 게임을 만들어줘.";

  // p 내용을 화면에 표시하고 추가할 수 있는 state
  const [pText, setPText] = useState(baseOrder);

  // 재미 요소 옵션 선택 상태 관리
  const [selectedOptions, setSelectedOptions] = useState({
    weather: false,
    difficulty: false,
    sound: false,
    control: false,
    timeLimit: false,
  });

  // 옵션 데이터 (화면에 보여질 텍스트와 실제 추가될 프롬프트 내용)
  const optionsData = {
    weather: { title: "날씨 변경: 비", desc: "“눈 내리는” → “비 내리는”", prompt: " 비 내리는 분위기로 변경해줘." },
    difficulty: { title: "난이도: 매운맛", desc: "“갈수록 엄청 어려워지게 해줘” 추가", prompt: " 갈수록 난이도가 엄청 어려워지게 해줘." },
    sound: { title: "사운드: 신나는 BGM", desc: "“신나는 8비트 배경음악 넣어줘” 추가", prompt: " 신나는 8비트 배경음악을 넣어줘." },
    control: { title: "조작 단순화: 원버튼", desc: "“조작은 스페이스바 하나로만 하게 해줘” 추가", prompt: " 조작은 스페이스바 키 하나로만 가능하게 해줘." },
    timeLimit: { title: "긴장감 UP: 60초 제한", desc: "“제한시간 60초 추가해줘” 추가", prompt: " 제한시간 60초 룰을 추가해줘." },
  };

  // 옵션 토글 핸들러
  const toggleOption = (key) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 최종 생성 버튼 핸들러
  const handleCreate = () => {
    // 기본 주문서에 선택된 옵션들의 프롬프트를 이어 붙임
    let finalPrompt = baseOrder;
    Object.keys(selectedOptions).forEach((key) => {
      if (selectedOptions[key]) {
        finalPrompt += optionsData[key].prompt;
      }
    });

    console.log("최종 프롬프트:", finalPrompt);
  // 게임 스튜디오로 이동 (사용자 요청)
  navigate("/gamestudio", { state: { finalPrompt } });
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    navigate("/customize/step1", { state: { order: baseOrder } });
  };

  // rectangle-4 클릭 시 text-wrapper-7의 내용을 p에 추가
  const handleAppend = (text) => {
    if (!text) return;
    setPText((prev) => (prev ? prev + " " + text : text));
  };

  return (
    <div className="customize-step2">
      <Header />
      {/* --- 왼쪽: 최종 주문서 확인 영역 --- */}
      <div className="rectangle">
        <div className="group" onClick={handleCreate} style={{ cursor: "pointer" }}>
          <div className="rectangle-3" />
          <div className="text-wrapper-4">이대로 만들기!</div>
        </div>
        <div className="rectangle-2" /> {/* 배경 장식용: rectangle 내부 가로 가운데 정렬 */}
      </div>
      <div className="text-wrapper">최종 주문서</div>
      <div className="text-wrapper-3">🤖 이렇게 만들면 될까요?</div>

      {/* 사용자가 작성한 주문 내용 표시 (pText로 관리) */}
      <div className="order-display-area">
        <div className="rectangle-2" />
        <p className="p">{pText}</p>
      </div>

      {/* 뒤로가기 버튼: 이미지 대신 CSS 삼각형으로 표시 */}
      <div className="polygon-wrapper" onClick={handleBack} style={{ cursor: "pointer" }}>
        <div className="polygon" />
      </div>
      <p className="text-wrapper-5">텍스트 수정은 이전 단계에서만 가능해요</p>

  {/* --- 중앙: 생성 버튼 (moved into .rectangle) --- */}

      {/* --- 오른쪽: 재미 요소 추가 옵션 영역 --- */}
      <div className="div" />
  <div className="text-wrapper-2">재미 요소 추가</div>

      {/* 1. 날씨 변경 (Weather) */}
    <div className="group-wrapper" onClick={() => toggleOption("weather")} style={{ cursor: "pointer" }}>
        <div className="group-2">
      <div className="rectangle-4" onClick={(e)=>{e.stopPropagation(); handleAppend(optionsData.weather.desc);}} />
          <div className="text-wrapper-6">{optionsData.weather.title}</div>
          <p className="text-wrapper-7">{optionsData.weather.desc}</p>
          <div className="group-3">
            <div className="div-2" />
            <div className="text-wrapper-8">☔</div>
          </div>
          {/* 선택 시 selected 클래스 추가 */}
          <div className={`ellipse ${selectedOptions.weather ? "selected" : ""}`} />
        </div>
      </div>

      {/* 2. 시간 제한 (Time Limit) - 위치: group-6 */}
    <div className="group-6" onClick={() => toggleOption("timeLimit")} style={{ cursor: "pointer" }}>
        <div className="group-7">
      <div className="rectangle-4" onClick={(e)=>{e.stopPropagation(); handleAppend(optionsData.timeLimit.desc);}} />
          <div className="text-wrapper-6">{optionsData.timeLimit.title}</div>
          <div className="text-wrapper-7">{optionsData.timeLimit.desc}</div>
          <div className="ellipse-container">
             <div className={`ellipse ${selectedOptions.timeLimit ? "selected" : ""}`} />
          </div>
        </div>
        <div className="group-3">
          <div className="div-2" />
          <div className="text-wrapper-11">⌛</div>
        </div>
      </div>

      {/* 3. 조작 단순화 (Control) - 위치: group-5 */}
    <div className="group-5" onClick={() => toggleOption("control")} style={{ cursor: "pointer" }}>
        <div className="group-2">
      <div className="rectangle-4" onClick={(e)=>{e.stopPropagation(); handleAppend(optionsData.control.desc);}} />
          <div className="text-wrapper-6">{optionsData.control.title}</div>
          <p className="text-wrapper-7">{optionsData.control.desc}</p>
          <div className="group-3">
            <div className="div-2" />
            <div className="text-wrapper-8">🔘</div>
          </div>
          <div className={`ellipse ${selectedOptions.control ? "selected" : ""}`} />
        </div>
      </div>

      {/* 4. 사운드 (Sound) - 위치: group-4 */}
    <div className="group-4" onClick={() => toggleOption("sound")} style={{ cursor: "pointer" }}>
        <div className="group-2">
      <div className="rectangle-4" onClick={(e)=>{e.stopPropagation(); handleAppend(optionsData.sound.desc);}} />
          <div className="text-wrapper-6">{optionsData.sound.title}</div>
          <p className="text-wrapper-7">{optionsData.sound.desc}</p>
          <div className="group-3">
            <div className="div-2" />
            <div className="text-wrapper-10">🎵</div>
          </div>
          <div className={`ellipse ${selectedOptions.sound ? "selected" : ""}`} />
        </div>
      </div>

      {/* 5. 난이도 (Difficulty) - 위치: div-wrapper */}
    <div className="div-wrapper" onClick={() => toggleOption("difficulty")} style={{ cursor: "pointer" }}>
        <div className="group-2">
      <div className="rectangle-4" onClick={(e)=>{e.stopPropagation(); handleAppend(optionsData.difficulty.desc);}} />
          <div className="text-wrapper-6">{optionsData.difficulty.title}</div>
          <p className="text-wrapper-7">{optionsData.difficulty.desc}</p>
          <div className="group-3">
            <div className="div-2" />
            <div className="text-wrapper-9">🔥</div>
          </div>
          <div className={`ellipse ${selectedOptions.difficulty ? "selected" : ""}`} />
        </div>
      </div>
    </div>
  );
};

export default CustomizeStep2;