// CustomizeStep1.js

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import "./CustomizeStep1.css";

export const CustomizeStep1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || "");

  const handleChange = (e) => {
    setOrder(e.target.value);
  };

  const handleQuickAdd = (item) => {
    setOrder((prevOrder) => prevOrder + " " + item);
  };

  const handleSubmit = () => {
    navigate("/customize/step2", { state: { order } });
  };

  return (
    <div className="customize-step1">
      <Header />
      <div className="text-wrapper">📝 주문서를 자유롭게 수정해보세요!</div>
      <div className="rectangle">
        <div className="order-box">
          <div className="order-title">직접 수정하기</div>
          <div className="order-input">
            <textarea
              value={order}
              onChange={handleChange}
              placeholder="눈 내리는 크리스마스 분위기로 두뇌를 자극하는 퍼즐 게임을 만들어줘."
            />
          </div>
        </div>
        <div className="quick-add-box">
          <div className="quick-add-title">빠른 추가 (클릭)</div>
          <div className="quick-add-buttons">
            <button onClick={() => handleQuickAdd("🎵 배경음악")}>
              + 🎵 배경음악
            </button>
            <button onClick={() => handleQuickAdd("👾 픽셀아트")}>
              + 👾 픽셀아트
            </button>
            <button onClick={() => handleQuickAdd("😈 어렵게")}>
              + 😈 어렵게
            </button>
            <button onClick={() => handleQuickAdd("⏳ 타임어택")}>
              + ⏳ 타임어택
            </button>
            <button onClick={() => handleQuickAdd("🏆 랭킹")}>+ 🏆 랭킹</button>
          </div>
        </div>
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        다음 →
      </button>
    </div>
  );
};

export default CustomizeStep1;