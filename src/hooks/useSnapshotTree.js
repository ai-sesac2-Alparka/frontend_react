import { useState, useCallback } from "react";
import { getSnapshotLog, restoreGameVersion, getGameData } from "../api/backend";

/**
 * SnapshotTree 데이터를 관리하는 Custom Hook
 * - 스냅샷 데이터 조회
 * - 버전 복원 및 자동 갱신 (게임 데이터 포함)
 * - 여러 컴포넌트에서 재사용 가능
 */
export const useSnapshotTree = (gameName) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 스냅샷 로그를 서버에서 가져와서 상태 갱신
   */
  const fetchSnapshots = useCallback(async () => {
    if (!gameName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getSnapshotLog(gameName);
      const data = response?.data;

      if (data && Array.isArray(data.versions)) {
        setVersions(data.versions);
        return data.versions;
      } else {
        console.warn(
          "스냅샷 응답 형식이 올바르지 않습니다. { versions: [...] } 예상"
        );
        setVersions([]);
        return [];
      }
    } catch (err) {
      console.error("스냅샷 로드 실패:", err);
      setError(err);
      setVersions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [gameName]);

  /**
   * 특정 버전으로 복원하고 스냅샷 데이터를 자동으로 갱신
   * 게임 데이터도 함께 갱신하여 모든 관련 데이터 동기화
   */
  const restoreAndRefresh = useCallback(
    async (targetVersion) => {
      if (!gameName || !targetVersion) return null;

      setLoading(true);
      setError(null);

      try {
        // 1. 서버에 복원 요청
        await restoreGameVersion(gameName, targetVersion);

        // 2. 최신 스냅샷 로그 재요청하여 화면 갱신
        const response = await getSnapshotLog(gameName);
        const data = response?.data;

        if (data && Array.isArray(data.versions)) {
          setVersions(data.versions);

          // 복원된 버전 정보 찾기
          const restoredVersion = data.versions.find(
            (v) => v.version === targetVersion
          );
          
          // 3. 게임 데이터도 자동으로 갱신 (스냅샷 복원 후 게임 상태 동기화)
          try {
            await getGameData(gameName);
          } catch (gdErr) {
            console.warn("게임 데이터 갱신 실패:", gdErr);
            // 게임 데이터 갱신 실패해도 스냅샷 복원은 성공으로 처리
          }
          
          return restoredVersion || null;
        } else {
          console.warn("스냅샷 응답 형식이 올바르지 않습니다.");
          return null;
        }
      } catch (err) {
        console.error("버전 복원 실패:", err);
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [gameName]
  );

  /**
   * 수동으로 스냅샷 갱신 (refetch와 동일)
   */
  const refreshSnapshot = fetchSnapshots;

  return {
    versions, // 현재 스냅샷 버전 배열
    loading, // 로딩 상태
    error, // 에러 객체
    fetchSnapshots, // 스냅샷 조회
    restoreAndRefresh, // 버전 복원 + 자동 갱신
    refreshSnapshot, // 수동 갱신
  };
};
