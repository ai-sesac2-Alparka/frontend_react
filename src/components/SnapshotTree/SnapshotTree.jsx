import React, { useMemo, useState, useEffect } from "react";
import "./SnapshotTree.css";
import { useSnapshotTree } from "../../hooks/useSnapshotTree";
import { useGame } from "../../contexts/GameContext";

/**
 * Linear snapshot history (latest first).
 * Simplified: no zoom/drag, no tree edges. Restore replaces current draft state.
 */
export default function SnapshotTree({
  gameName,
  projectId: projectIdProp,
  showImportExport = true,
}) {
  const {
    snapshots: contextSnapshots,
    setSnapshots,
    setGameData,
    setAssets,
    setAssetStamp,
    projectId: projectIdCtx,
    gameTitle,
  } = useGame();

  const target = useMemo(
    () => ({
      projectId: projectIdProp || projectIdCtx || "",
      gameName: gameName || gameTitle || "",
    }),
    [projectIdProp, projectIdCtx, gameName, gameTitle],
  );

  const {
    versions: hookVersions,
    restoreAndRefresh: restoreSnapshot,
    fetchSnapshots,
  } = useSnapshotTree(target);

  const [customData, setCustomData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const versions = customData?.versions || contextSnapshots || hookVersions;
  const sorted = useMemo(
    () =>
      Array.isArray(versions)
        ? [...versions].sort(
            (a, b) =>
              new Date(b.timestamp || b.created_at) -
              new Date(a.timestamp || a.created_at),
          )
        : [],
    [versions],
  );

  useEffect(() => {
    if (
      (target.projectId || target.gameName) &&
      !customData &&
      (!contextSnapshots || contextSnapshots.length === 0)
    ) {
      fetchSnapshots();
    }
  }, [target, customData, contextSnapshots, fetchSnapshots]);

  const handleRestore = async (version) => {
    if (!version) return;
    setIsApplying(true);
    try {
      const result = await restoreSnapshot(version);
      if (result) {
        if (result.snapshots) setSnapshots(result.snapshots);
        if (result.gameData) setGameData(result.gameData);
        if (result.assets) {
          const backendUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
          const images = Array.isArray(result.assets.images)
            ? result.assets.images.map((img, idx) => ({
                id: `img-${idx}`,
                type: "image",
                name: img.name,
                src: img.url?.startsWith("http")
                  ? img.url
                  : `${backendUrl}${img.url}`,
              }))
            : [];
          const sounds = Array.isArray(result.assets.sounds)
            ? result.assets.sounds.map((snd, idx) => ({
                id: `snd-${idx}`,
                type: "sound",
                name: snd.name,
                src: snd.url?.startsWith("http")
                  ? snd.url
                  : `${backendUrl}${snd.url}`,
              }))
            : [];
          setAssets([...images, ...sounds]);
          setAssetStamp(Date.now());
        }
        setSelected(version);
      }
    } catch (err) {
      console.error("복원 실패:", err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        setCustomData(json);
      } catch (err) {
        console.error("JSON 파싱 실패:", err);
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ versions: versions || [] }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snapshot-log.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="snapshot-tree-container">
      <div className="snapshot-toolbar">
        <div className="toolbar-left">
          <h3>스냅샷 히스토리</h3>
          <div className="actions">
            <button onClick={() => fetchSnapshots()}>새로고침</button>
            {showImportExport && (
              <>
                <button
                  onClick={() => document.getElementById("snap-import")?.click()}
                >
                  가져오기
                </button>
                <button onClick={handleExport}>내보내기</button>
                <input
                  id="snap-import"
                  type="file"
                  accept="application/json,.json"
                  style={{ display: "none" }}
                  onChange={handleImport}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="linear-list">
        {sorted.length === 0 && (
          <div className="empty-message">스냅샷이 없습니다.</div>
        )}
        {sorted.map((v) => {
          const ts = new Date(v.timestamp || v.created_at).toLocaleString();
          return (
            <div
              key={v.version}
              className={`linear-item ${selected === v.version ? "selected" : ""}`}
            >
              <div className="linear-meta">
                <div className="linear-version">v{v.version}</div>
                <div className="linear-time">{ts}</div>
              </div>
              <div className="linear-actions">
                <button onClick={() => setSelected(v.version)}>선택</button>
                <button
                  onClick={() => handleRestore(v.version)}
                  disabled={isApplying}
                >
                  {isApplying && selected === v.version ? "복원 중..." : "복원"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
