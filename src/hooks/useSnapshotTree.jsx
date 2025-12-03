import { useState, useCallback, useMemo } from "react";
import {
  getSnapshotLog,
  restoreGameVersion,
  getGameData,
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

export const useSnapshotTree = (target) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ctx = useMemo(() => normalizeTarget(target), [target]);

  const fetchSnapshots = useCallback(async () => {
    if (!ctx.projectId && !ctx.gameName) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await getSnapshotLog(ctx);
      const data = response?.data;

      if (data && Array.isArray(data.versions)) {
        setVersions(data.versions);
        return data.versions;
      }
      setVersions([]);
      return [];
    } catch (err) {
      console.error("스냅샷 로드 실패:", err);
      setError(err);
      setVersions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [ctx]);

  const restoreAndRefresh = useCallback(
    async (targetVersion) => {
      if ((!ctx.projectId && !ctx.gameName) || !targetVersion) return null;

      setLoading(true);
      setError(null);

      try {
        await restoreGameVersion(ctx, targetVersion);

        const response = await getSnapshotLog(ctx);
        const data = response?.data;

        if (data && Array.isArray(data.versions)) {
          setVersions(data.versions);
          const restoredVersion = data.versions.find(
            (v) => v.version === targetVersion,
          );

          let gameData = null;
          try {
            const gameDataResponse = await getGameData(ctx);
            gameData = gameDataResponse?.data;
          } catch (gdErr) {
            console.warn("게임 데이터 갱신 실패:", gdErr);
          }

          let assetsData = null;
          try {
            const assetsResponse = await getGameAssets(ctx);
            assetsData = assetsResponse?.data;
          } catch (assetsErr) {
            console.warn("에셋 갱신 실패:", assetsErr);
          }

          return {
            version: restoredVersion || null,
            snapshots: data.versions,
            gameData: gameData,
            assets: assetsData,
          };
        }
        return {
          version: null,
          snapshots: [],
          gameData: null,
          assets: null,
        };
      } catch (err) {
        console.error("버전 복원 실패:", err);
        setError(err);
        return {
          version: null,
          snapshots: [],
          gameData: null,
          assets: null,
        };
      } finally {
        setLoading(false);
      }
    },
    [ctx],
  );

  return {
    versions,
    loading,
    error,
    fetchSnapshots,
    restoreAndRefresh,
  };
};
