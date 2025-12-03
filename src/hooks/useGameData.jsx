import { useState, useCallback, useMemo } from "react";
import {
  getGameData,
  updateGameData,
  getSnapshotLog,
  getGameAssets,
} from "../api/backend";

const normalizeTarget = (target) => {
  if (typeof target === "string")
    return { projectId: target || "", gameName: "" };
  if (!target) return { projectId: "", gameName: "" };
  return {
    projectId: target.projectId || target.project_id || "",
    gameName: target.gameName || target.game_name || "",
  };
};

export const useGameData = (target) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ctx = useMemo(() => normalizeTarget(target), [target]);

  const fetchGameData = useCallback(async () => {
    if (!ctx.projectId && !ctx.gameName) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await getGameData(ctx);
      const data = response?.data;
      if (data && typeof data === "object") {
        if (data.working_data) return data.working_data;
        return data;
      }
      console.warn("게임 데이터 응답 형식이 올바르지 않습니다.");
      return null;
    } catch (err) {
      console.error("게임 데이터 로드 실패:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ctx]);

  const saveAndRefresh = useCallback(
    async (data) => {
      if ((!ctx.projectId && !ctx.gameName) || !data) return null;

      setLoading(true);
      setError(null);

      try {
        await updateGameData(ctx, data);

        const response = await getGameData(ctx);
        const updatedData = response?.data?.working_data || response?.data;

        let snapshotData = null;
        try {
          const snapResponse = await getSnapshotLog(ctx);
          snapshotData = snapResponse?.data;
        } catch (snapErr) {
          console.warn("스냅샷 로그 갱신 실패:", snapErr);
        }

        let assetsData = null;
        try {
          const assetsResponse = await getGameAssets(ctx);
          assetsData = assetsResponse?.data;
        } catch (assetsErr) {
          console.warn("에셋 갱신 실패:", assetsErr);
        }

        return {
          gameData: updatedData || null,
          snapshots: snapshotData?.versions || null,
          assets: assetsData || null,
        };
      } catch (err) {
        console.error("게임 데이터 저장 실패:", err);
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [ctx],
  );

  const refreshGameData = fetchGameData;

  return {
    loading,
    error,
    fetchGameData,
    saveAndRefresh,
    refreshGameData,
  };
};
