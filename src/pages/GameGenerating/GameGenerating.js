// src/pages/GameGenerating/GameGenerating.js

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./GameGenerating.css";

// public/images 폴더에 loading.gif가 있다고 가정합니다.
// 만약 src 내부에 있다면 import loadingGif from '../../assets/loading.gif' 식으로 변경해야 합니다.
const loadingGif = "/images/loading.gif"; 

const GameGenerating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // CustomizeStep2에서 전달받은 프롬프트 데이터
  const finalPrompt = location.state?.finalPrompt || "";

  useEffect(() => {
    // 실제로는 여기서 백엔드 API에 게임 생성을 요청합니다.
    console.log("요청된 프롬프트:", finalPrompt);

    // 임시: 3초 뒤에 게임 생성이 완료되었다고 가정하고 스튜디오 페이지로 이동
    const timer = setTimeout(() => {
      // 게임 생성이 완료되면 스튜디오로 이동 (게임 ID 등을 함께 넘겨줄 수 있습니다)
      navigate("/studio"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, finalPrompt]);

  return (
    <div className="element-creating">
      <div className="content-wrapper">
        <div className="text-wrapper">뚝딱! 게임 생성 중…</div>
        
        {/* 중앙 움짤 배치 */}
        <div className="image-container">
          <img src={loadingGif} alt="게임 생성 중" className="loading-gif" />
        </div>

        <p className="div">AI가 코드를 작성하고 그래픽을 그리고 있습니다.</p>
      </div>
    </div>
  );
};

export default GameGenerating;