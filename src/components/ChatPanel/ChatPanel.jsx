import React, { useState, useEffect, useRef, useMemo } from "react";
import "./ChatPanel.css";
import {
  sendErrorBatch,
  getSnapshotLog,
  getGameData,
  revertGame,
  processCodeMessage,
  getChat,
} from "../../api/backend";
import { useGame } from "../../contexts/GameContext";

export default function ChatPanel({
  initialMessages = [],
  onReady = null,
  gameErrorBatch = null,
  onErrorBatchHandled = null,
}) {
  const { gameTitle, projectId, setGameData, setSnapshots } = useGame();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const target = useMemo(
    () => ({ gameName: gameTitle, projectId }),
    [gameTitle, projectId],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 함수: 외부에서 메시지를 추가할 때 사용
  const addMessage = (msg) => {
    setMessages((m) => [...m, msg]);
  };

  useEffect(() => {
    if (typeof onReady === "function") {
      onReady(addMessage);
    }
  }, [onReady]);

  // 페이지 로드 시 채팅 이력 불러오기
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!gameTitle && !projectId) return;

      try {
        const response = await getChat(target);
        const chatData = response?.data?.chat;

        if (Array.isArray(chatData) && chatData.length > 0) {
          // from을 type으로 변환
          const formattedMessages = chatData.map((msg) => ({
            ...msg,
            type: msg.from === "user" ? "user" : "bot",
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.warn("채팅 이력 로드 실패:", error);
      }
    };

    loadChatHistory();
  }, [gameTitle, projectId, target]);

  // 게임 에러 배치가 들어오면 메시지 추가
  useEffect(() => {
    if (!gameErrorBatch) return;

    const errorText =
      gameErrorBatch.error_report || "에러 정보를 불러올 수 없습니다.";

    const errorMessage = {
      id: `error-${Date.now()}`,
      text: errorText,
      type: "bot",
      errorType: "error-batch",
      errorData: gameErrorBatch,
    };
    setMessages((prev) => [...prev, errorMessage]);

    const sendError = async () => {
      try {
        await sendErrorBatch(target, gameErrorBatch);
        console.log("✅ FastAPI 서버로 에러 전송 성공");
      } catch (error) {
        console.error("❌ FastAPI 서버로 에러 전송 실패:", error);
      } finally {
        if (typeof onErrorBatchHandled === "function") {
          onErrorBatchHandled();
        }
      }
    };

    sendError();
  }, [gameErrorBatch, onErrorBatchHandled, target]);

  // 공통: 스냅샷 로그 및 게임 데이터 최신화
  const refreshSnapshotAndGameData = async () => {
    try {
      const snapRes = await getSnapshotLog(target);
      const data = snapRes?.data;
      if (data && setSnapshots) {
        setSnapshots(data.versions || data);
      }
    } catch (snapErr) {
      console.warn("스냅샷 로그 가져오기 실패:", snapErr);
    }

    if (setGameData && (gameTitle || projectId)) {
      try {
        const res = await getGameData(target);
        const payload = res?.data;
        if (payload && typeof payload === "object") {
          setGameData(payload);
        } else {
          console.warn("예상치 못한 /game_data 응답 형식:", payload);
        }
      } catch (gdErr) {
        console.warn("게임 데이터 갱신 실패(/game_data):", gdErr);
      }
    }
  };

  const handleRevert = async () => {
    try {
      const response = await revertGame(target);

      const botMessage = {
        text: response.data.reply || "이전 상태로 되돌렸습니다.",
        type: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);

      await refreshSnapshotAndGameData();
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "서버 오류 발생(되돌리기 작업).",
          type: "bot",
        },
      ]);
    }
  };

  const sendCodeMessage = async (messageText, tempText) => {
    const userMessage = { text: messageText, type: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const tempBotMessage = { id: Date.now(), text: tempText, type: "bot" };
    setMessages((prev) => [...prev, tempBotMessage]);

    try {
      const response = await processCodeMessage(messageText, target);

      if (response.data.status === "success") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempBotMessage.id
              ? { text: response.data.reply, type: "bot" }
              : msg,
          ),
        );
        await refreshSnapshotAndGameData();
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempBotMessage.id
              ? { text: "서버 오류: " + response.data.reply, type: "bot" }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "서버 오류 발생.", type: "bot" },
      ]);
    }
  };

  const handleFixError = async (errorData) => {
    const errorReport =
      errorData.error_report || "에러 정보를 불러올 수 없습니다.";
    const fixRequestMessage = `다음 런타임 오류를 수정해주세요:\n\n${errorReport}`;
    sendCodeMessage(fixRequestMessage, "오류를 분석하고 수정하는 중입니다...");
  };

  const send = () => {
    if (!input.trim()) return;
    const currentMessage = input;
    setInput("");
    sendCodeMessage(currentMessage, "응답을 생성하는 중입니다...");
  };

  const bgUrl = (import.meta.env.BASE_URL || "") + "images/background.svg";

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>AI 도우미🧚🏻‍♀️</h3>
        <button onClick={handleRevert} className="revert-button">
          최근 변경사항 되돌리기
        </button>
      </div>
      <div
        className="chat-messages"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`message ${msg.type}`}>
            <div className="message-content">
              <div
                className="message-bubble"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text}
                {msg.errorType === "error-batch" && msg.errorData && (
                  <button
                    onClick={() => handleFixError(msg.errorData)}
                    className="error-fix-button"
                  >
                    런타임 오류 수정 요청
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
          className="chat-input"
        />
        <button onClick={send}>전송</button>
      </div>
    </div>
  );
}
