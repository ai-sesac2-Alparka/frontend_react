import { useState, useCallback } from "react";
import { getGameData, updateGameData, getSnapshotLog } from "../api/backend";

/**
 * GameData(게임 설정 데이터)를 관리하는 Custom Hook
 * - 게임 데이터 조회
 * - 게임 데이터 저장 및 갱신
 * - 스냅샷 로그 자동 동기화
 * - 여러 컴포넌트에서 재사용 가능
 */
export const useGameData = (gameName) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 게임 데이터를 서버에서 가져와서 상태 갱신
   */
  const fetchGameData = useCallback(async () => {
    if (!gameName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getGameData(gameName);
      const data = response?.data;

      if (data && typeof data === "object") {
        setGameData(data);
        return data;
      } else {
        console.warn("게임 데이터 응답 형식이 올바르지 않습니다.");
        setGameData(null);
        return null;
      }
    } catch (err) {
      console.error("게임 데이터 로드 실패:", err);
      setError(err);
      setGameData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [gameName]);

  /**
   * 게임 데이터를 서버에 저장하고 자동으로 갱신
   * 스냅샷 로그도 함께 갱신하여 데이터 일관성 유지
   */
  const saveAndRefresh = useCallback(
    async (data) => {
      if (!gameName || !data) return null;

      setLoading(true);
      setError(null);

      try {
        // 1. 서버에 데이터 업데이트 요청
        await updateGameData(gameName, data);

        // 2. 최신 게임 데이터 재요청하여 화면 갱신
        const response = await getGameData(gameName);
        const updatedData = response?.data;

        // 3. 스냅샷 로그도 자동 갱신 (데이터 변경 시 버전 정보 동기화)
        await getSnapshotLog(gameName);

        if (updatedData && typeof updatedData === "object") {
          setGameData(updatedData);
          return updatedData;
        } else {
          console.warn("게임 데이터 갱신 실패");
          return null;
        }
      } catch (err) {
        console.error("게임 데이터 저장 실패:", err);
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [gameName]
  );

  /**
   * 수동으로 게임 데이터 갱신
   */
  const refreshGameData = fetchGameData;

  /**
   * 로컬 상태만 업데이트 (서버 전송 없이)
   */
  const updateLocalData = useCallback((data) => {
    setGameData(data);
  }, []);

  return {
    gameData, // 현재 게임 데이터 객체
    loading, // 로딩 상태
    error, // 에러 객체
    fetchGameData, // 게임 데이터 조회
    saveAndRefresh, // 데이터 저장 + 자동 갱신
    refreshGameData, // 수동 갱신
    updateLocalData, // 로컬 상태만 업데이트
  };
};
