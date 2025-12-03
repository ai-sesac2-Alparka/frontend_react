// src/pages/GameGenerating/GameGenerating.js

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUniqueId, processCodeMessage } from "../../api/backend";
import "./GameGenerating.css";

// public/images 폴더의 gamegenerating.gif 사용
const loadingGif = "/images/gamegenerating.gif";

const GameGenerating = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // CustomizeStep2에서 전달받은 프롬프트 데이터
  const finalPrompt = location.state?.finalPrompt || "";
  const [error, setError] = useState(null);
  const hasCreated = useRef(false); // 중복 실행 방지

  useEffect(() => {
    // 이미 실행되었으면 중단
    if (hasCreated.current) return;
    if (!finalPrompt) return;

    hasCreated.current = true; // 실행 표시

    const createGame = async () => {
      try {
        console.log("요청된 프롬프트:", finalPrompt);

        // 1. 고유 ID 받아오기
        const idResponse = await getUniqueId();
        const gameId =
          idResponse.data?.id || idResponse.data?.game_id || idResponse.data;
        console.log("받아온 게임 ID:", gameId);

        if (!gameId) {
          throw new Error("게임 ID를 받아오지 못했습니다.");
        }

        // 2. process-code 호출하여 게임 생성 요청
        await processCodeMessage(finalPrompt, gameId);
        console.log("게임 생성 완료");

        // 3. 게임 스튜디오로 이동 (gameName 쿼리 파라미터로 전달)
        navigate(`/studio?gameName=${gameId}`);
      } catch (err) {
        console.error("게임 생성 실패:", err);
        setError("게임 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
        hasCreated.current = false; // 에러 시 재시도 가능하도록
      }
    };

    createGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalPrompt]); // navigate 제거

  return (
    <div className="element-creating">
      <div className="content-wrapper">
        {error ? (
          <>
            <div className="text-wrapper" style={{ color: "#ff4444" }}>
              오류 발생
            </div>
            <p className="div">{error}</p>
            <button
              onClick={() => navigate("/customize/step2")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              돌아가기
            </button>
          </>
        ) : (
          <>
            <div className="text-wrapper">뚝딱! 게임 생성 중…</div>

            {/* 중앙 움짤 배치 */}
            <div className="image-container">
              <img
                src={loadingGif}
                alt="게임 생성 중"
                className="loading-gif"
              />
            </div>

            <p className="div">
              AI가 코드를 작성하고 그래픽을 그리고 있습니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GameGenerating;
