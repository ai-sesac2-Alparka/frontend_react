import { useState, useCallback } from "react";
import { getGameAssets, replaceAsset, getSnapshotLog } from "../api/backend";

/**
 * Assets(에셋) 데이터를 관리하는 Custom Hook
 * - 에셋 데이터 조회
 * - 에셋 교체 및 갱신
 * - 스냅샷 로그 자동 동기화
 * - 여러 컴포넌트에서 재사용 가능
 */
export const useAssets = (gameName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 에셋 목록을 서버에서 가져오기
   */
  const fetchAssets = useCallback(async () => {
    if (!gameName || !gameName.trim()) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getGameAssets(gameName);
      const data = res?.data;

      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

      const images = Array.isArray(data?.images)
        ? data.images.map((img, idx) => ({
            id: `img-${idx}`,
            type: "image",
            name: img.name,
            src: img.url.startsWith("http")
              ? img.url
              : `${backendUrl}${img.url}`,
            url: img.url.startsWith("http")
              ? img.url
              : `${backendUrl}${img.url}`,
          }))
        : [];

      const sounds = Array.isArray(data?.sounds)
        ? data.sounds.map((snd, idx) => ({
            id: `snd-${idx}`,
            type: "audio",
            name: snd.name,
            src: snd.url.startsWith("http")
              ? snd.url
              : `${backendUrl}${snd.url}`,
            url: snd.url.startsWith("http")
              ? snd.url
              : `${backendUrl}${snd.url}`,
          }))
        : [];

      const allAssets = [...images, ...sounds];
      return allAssets;
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("에셋 목록을 불러오지 못했습니다.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [gameName]);

  /**
   * 에셋을 교체하고 최신 에셋 및 스냅샷 반환
   */
  const replaceAndRefresh = useCallback(
    async (selectedAsset, file) => {
      if (!gameName || !selectedAsset || !file) return null;

      // MP3 파일 검증 (사운드인 경우)
      if (selectedAsset.type === "audio") {
        const nameLower = file.name.toLowerCase();
        if (!nameLower.endsWith(".mp3")) {
          throw new Error("사운드 교체는 MP3 파일만 가능합니다.");
        }
      }

      setLoading(true);
      setError(null);

      try {
        // 1. 서버에 에셋 교체 요청
        await replaceAsset(gameName, selectedAsset, file);

        // 2. 최신 에셋 목록 재요청
        const updatedAssets = await fetchAssets();

        // 3. 스냅샷 로그도 자동 갱신
        let snapshotData = null;
        try {
          const snapRes = await getSnapshotLog(gameName);
          snapshotData = snapRes?.data;
        } catch (snapErr) {
          console.warn("스냅샷 로그 갱신 실패:", snapErr);
        }

        return {
          assets: updatedAssets,
          snapshots: snapshotData?.versions || null,
        };
      } catch (err) {
        console.error("에셋 교체 실패:", err);
        setError(err.message || "에셋 교체 중 오류가 발생했습니다.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [gameName, fetchAssets]
  );

  /**
   * 수동으로 에셋 갱신 (refetch와 동일)
   */
  const refreshAssets = fetchAssets;

  return {
    loading, // 로딩 상태
    error, // 에러 메시지
    fetchAssets, // 에셋 조회 (assets 배열 반환)
    replaceAndRefresh, // 에셋 교체 + 자동 갱신 (assets, snapshots 반환)
    refreshAssets, // 수동 갱신
  };
};
