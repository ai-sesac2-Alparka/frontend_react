import { useState, useCallback, useMemo } from "react";
import {
  getGameAssets,
  replaceAsset,
  getSnapshotLog,
  getGameData,
} from "../api/backend";

const normalizeTarget = (target) => {
  if (typeof target === "string") {
    return { projectId: undefined, gameName: target || "" };
  }
  if (!target) {
    return { projectId: undefined, gameName: "" };
  }
  return {
    projectId: target.projectId || target.project_id,
    gameName:
      target.gameName ||
      target.game_name ||
      target.projectId ||
      target.project_id ||
      "",
  };
};

/**
 * Assets(에셋) 데이터를 관리하는 Custom Hook
 * - 에셋 데이터 조회
 * - 에셋 교체 및 갱신
 * - 스냅샷 로그 자동 동기화
 * - 여러 컴포넌트에서 재사용 가능
 */
export const useAssets = (target) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ctx = useMemo(() => normalizeTarget(target), [target]);

  /**
   * 에셋 목록을 서버에서 가져오기
   */
  const fetchAssets = useCallback(async () => {
    if (!ctx.gameName?.trim() && !ctx.projectId) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getGameAssets(ctx);
      const data = res?.data;

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      const images = Array.isArray(data?.images)
        ? data.images.map((img, idx) => ({
            id: `img-${idx}`,
            type: img.asset_type || img.type || "image",
            name: img.name,
            src: img.url.startsWith("http")
              ? img.url
              : `${backendUrl}${img.url}`,
            url: img.url.startsWith("http")
              ? img.url
              : `${backendUrl}${img.url}`,
            storagePath: img.storage_path,
            projectId: img.project_id,
            metadata: img.metadata || {},
            checksum: img.metadata?.checksum_sha256,
            label: img.asset_type || img.type || "image",
            kind: "image",
          }))
        : [];

      const sounds = Array.isArray(data?.sounds)
        ? data.sounds.map((snd, idx) => ({
            id: `snd-${idx}`,
            type: snd.asset_type || snd.type || "sound",
            name: snd.name,
            src: snd.url.startsWith("http")
              ? snd.url
              : `${backendUrl}${snd.url}`,
            url: snd.url.startsWith("http")
              ? snd.url
              : `${backendUrl}${snd.url}`,
            storagePath: snd.storage_path,
            projectId: snd.project_id,
            metadata: snd.metadata || {},
            checksum: snd.metadata?.checksum_sha256,
            label: snd.asset_type || snd.type || "sound",
            kind: "sound",
          }))
        : [];

      const allAssets = [...images, ...sounds];
      const deduped = [];
      const seen = new Set();
      allAssets.forEach((a) => {
        const displayName = (a.name || "").split("_").pop();
        if (seen.has(displayName)) return;
        seen.add(displayName);
        deduped.push({ ...a, displayName });
      });
      return deduped;
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("에셋 목록을 불러오지 못했습니다.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [ctx]);

  /**
   * 에셋을 교체하고 최신 에셋 및 스냅샷 반환
   */
  const replaceAndRefresh = useCallback(
    async (selectedAsset, file) => {
      if ((!ctx.gameName?.trim() && !ctx.projectId) || !selectedAsset || !file)
        return null;

      // MP3 파일 검증 (사운드인 경우)
      if (selectedAsset.type === "sound") {
        const nameLower = file.name.toLowerCase();
        if (!nameLower.endsWith(".mp3")) {
          throw new Error("사운드 교체는 MP3 파일만 가능합니다.");
        }
      }

      setLoading(true);
      setError(null);

      try {
        // 1. 서버에 에셋 교체 요청
        await replaceAsset(ctx, selectedAsset, file);

        // 2. 최신 에셋 목록 재요청
        const updatedAssets = await fetchAssets();

        // 3. 스냅샷 로그도 자동 갱신
        let snapshotData = null;
        try {
          const snapRes = await getSnapshotLog(ctx);
          snapshotData = snapRes?.data;
        } catch (snapErr) {
          console.warn("스냅샷 로그 갱신 실패:", snapErr);
        }

        // 4. 게임 데이터도 자동 갱신
        let gameData = null;
        try {
          const gameDataResponse = await getGameData(ctx);
          gameData = gameDataResponse?.data;
        } catch (gdErr) {
          console.warn("게임 데이터 갱신 실패:", gdErr);
        }

        return {
          assets: updatedAssets,
          snapshots: snapshotData?.versions || null,
          gameData: gameData || null,
        };
      } catch (err) {
        console.error("에셋 교체 실패:", err);
        setError(err.message || "에셋 교체 중 오류가 발생했습니다.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ctx, fetchAssets],
  );

  /**
   * 수동으로 에셋 갱신 (refetch와 동일)
   */
  const refreshAssets = fetchAssets;

  return {
    loading, // 로딩 상태
    error, // 에러 메시지
    fetchAssets, // 에셋 조회 (assets 배열 반환)
    replaceAndRefresh, // 에셋 교체 + 자동 갱신 (assets, snapshots, gameData 반환)
    refreshAssets, // 수동 갱신
  };
};
