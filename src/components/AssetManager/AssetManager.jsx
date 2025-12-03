import React, { useState, useEffect, useRef } from "react";
import "./AssetManager.css";
import { useGame } from "../../contexts/GameContext";
import { useAssets } from "../../hooks/useAssets";
import { quadrakillAdapter } from "../../api/quadrakillAdapter";

export default function AssetManager({
  onPromptSubmit = () => {},
  onSnapshotUpdate = null,
}) {
  const {
    gameTitle,
    projectId,
    assets: contextAssets,
    setAssets,
    setSnapshots,
    setGameData,
    assetStamp,
    setAssetStamp,
  } = useGame();
  const { loading, error, fetchAssets, replaceAndRefresh } = useAssets({
    projectId,
    gameName: gameTitle,
  });

  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef(null);
  const [filterKind, setFilterKind] = useState("all"); // all | image | sound
  const quickUploadRef = useRef(null);

  // Context의 assets 사용
  const assets = contextAssets || [];

  useEffect(() => {
    if (!gameTitle || !gameTitle.trim()) return;
    // Context에 데이터가 없을 때만 백엔드에서 fetch
    if (!contextAssets || contextAssets.length === 0) {
      const loadAssets = async () => {
        const result = await fetchAssets();
        if (result) {
          setAssets(result);
        }
      };
      loadAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameTitle, projectId]); // gameTitle만 의존성으로 설정

  // 사운드 에셋 선택 시 자동 재생
  useEffect(() => {
    if (selected?.type === "sound" && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log("자동 재생 실패 (사용자 상호작용 필요):", err);
      });
    }
  }, [selected]);

  const open = (asset) => {
    setSelected(asset);
    setPrompt("");
  };
  const close = () => setSelected(null);

  const handleSubmitPrompt = () => {
    if (!prompt.trim()) return;
    // 전달: 부모(GameStudio)에서 ChatPanel로 포워딩
    onPromptSubmit(prompt.trim(), selected);
    setPrompt("");
    close();
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다.");
    } catch (err) {
      console.warn("클립보드 복사 실패:", err);
    }
  };

  return (
    <div className="asset-manager">
      {error && (
        <div className="asset-error" style={{ padding: 16, color: "red" }}>
          {error}
        </div>
      )}
      {loading && <div style={{ padding: 16 }}>로딩 중...</div>}

      {!loading && (
        <div className="asset-sections-container">
          {!selected && (
            <div
              className="asset-quick-upload"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <label
                className="upload-label"
                style={{ display: "flex", gap: 8 }}
                htmlFor="quick-upload"
              >
                파일 선택
                <input
                  ref={quickUploadRef}
                  type="file"
                  id="quick-upload"
                  aria-label="파일 선택"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!projectId) {
                      alert("projectId가 필요합니다");
                      return;
                    }
                    try {
                      setUploading(true);
                      await quadrakillAdapter.assets.upload({
                        file,
                        type: file.type?.startsWith("image/") ? "image" : "raw",
                        projectId,
                        name: file.name,
                      });
                      const refreshed = await fetchAssets();
                      if (refreshed) {
                        setAssets(refreshed);
                        setAssetStamp(Date.now());
                      }
                    } catch (err) {
                      console.error("quick upload failed:", err);
                      alert(err.message || "업로드 중 오류가 발생했습니다.");
                    } finally {
                      setUploading(false);
                      if (quickUploadRef.current) {
                        quickUploadRef.current.value = "";
                      }
                    }
                  }}
                />
              </label>
              {uploading && <span style={{ fontSize: 12 }}>업로드 중…</span>}
            </div>
          )}
          <div className="asset-filters">
            <label>
              타입 필터:
              <select
                value={filterKind}
                onChange={(e) => setFilterKind(e.target.value)}
                aria-hidden="true"
                tabIndex={-1}
              >
                <option value="all">전체</option>
                <option value="image">이미지</option>
                <option value="sound">사운드</option>
              </select>
            </label>
          </div>
          {/* 이미지 섹션 */}
          <section className="asset-section">
            <h3 className="section-title">이미지</h3>
            <div className="assets-grid">
              {assets.filter(
                (a) =>
                  a.kind === "image" &&
                  (filterKind === "all" || filterKind === "image"),
              ).length === 0 && (
                <div className="empty-message">이미지가 없습니다.</div>
              )}
              {assets
                .filter(
                  (a) =>
                    a.kind === "image" &&
                    (filterKind === "all" || filterKind === "image"),
                )
                .map((a) => {
                  const stampedSrc = assetStamp
                    ? `${a.src}?v=${assetStamp}`
                    : a.src;
                  return (
                    <div
                      key={a.id}
                      className="asset-item"
                      onClick={() => open(a)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="asset-preview">
                        <img src={stampedSrc} alt={a.name} />
                      </div>
                      <div className="asset-name">
                        {a.displayName || a.name}{" "}
                        {a.type && a.type !== "image" ? `(${a.type})` : ""}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* 사운드 섹션 */}
          <section className="asset-section">
            <h3 className="section-title">사운드</h3>
            <div className="assets-grid">
              {assets.filter(
                (a) =>
                  a.kind === "sound" &&
                  (filterKind === "all" || filterKind === "sound"),
              ).length === 0 && (
                <div className="empty-message">사운드가 없습니다.</div>
              )}
              {assets
                .filter(
                  (a) =>
                    a.kind === "sound" &&
                    (filterKind === "all" || filterKind === "sound"),
                )
                .map((a) => {
                  return (
                    <div
                      key={a.id}
                      className="asset-item"
                      onClick={() => open(a)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="asset-preview">
                        <div className="audio-placeholder">🎵</div>
                      </div>
                      <div className="asset-name">
                        {a.displayName || a.name}{" "}
                        {a.type && a.type !== "sound" ? `(${a.type})` : ""}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      )}

      {selected && (
        <div className="asset-modal-overlay" onClick={close}>
          <div className="asset-modal" onClick={(e) => e.stopPropagation()}>
            <button className="asset-modal-x" aria-label="닫기" onClick={close}>
              ×
            </button>
            <h3 className="asset-modal-title">선택한 에셋</h3>
            <div className="asset-modal-body">
              <div className="asset-meta">
                {selected.type && (
                  <div className="asset-meta-row">타입: {selected.type}</div>
                )}
                {selected.projectId && (
                  <div className="asset-meta-row">
                    프로젝트: {selected.projectId}
                    <button
                      className="asset-meta-copy"
                      onClick={() => copyToClipboard(selected.projectId)}
                    >
                      복사
                    </button>
                  </div>
                )}
                {selected.storagePath && (
                  <div className="asset-meta-row">
                    {(() => {
                      const parts = selected.storagePath.split("/");
                      const dir =
                        parts.length > 1
                          ? parts.slice(0, parts.length - 1).join("/")
                          : selected.storagePath;
                      return (
                        <>
                          경로: {dir}
                          <button
                            className="asset-meta-copy"
                            onClick={() => copyToClipboard(dir)}
                          >
                            복사
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
                {selected.metadata?.checksum_sha256 && (
                  <div className="asset-meta-row">
                    SHA256: {selected.metadata.checksum_sha256.slice(0, 12)}…
                    <button
                      className="asset-meta-copy"
                      onClick={() =>
                        copyToClipboard(selected.metadata.checksum_sha256)
                      }
                    >
                      복사
                    </button>
                  </div>
                )}
                {!selected.metadata?.checksum_sha256 && (
                  <div className="asset-meta-row">SHA256: 없음</div>
                )}
              </div>
              <div className="asset-modal-preview-large">
                {selected.type === "image" && selected.src ? (
                  <img
                    src={
                      assetStamp
                        ? `${selected.src}?v=${assetStamp}`
                        : selected.src
                    }
                    alt={selected.name}
                  />
                ) : selected.type === "sound" && selected.src ? (
                  <audio
                    ref={audioRef}
                    controls
                    src={
                      assetStamp
                        ? `${selected.src}?v=${assetStamp}`
                        : selected.src
                    }
                    style={{ width: "100%" }}
                  />
                ) : (
                  <div style={{ padding: 20 }}>미리보기 없음</div>
                )}
              </div>
              <div className="asset-modal-controls">
                <label className="upload-label">
                  파일 선택
                  <input
                    type="file"
                    className="asset-file-input"
                    accept={
                      selected.type === "image" ? "image/*" : "audio/mpeg,.mp3"
                    }
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setUploading(true);
                        const result = await replaceAndRefresh(selected, file);

                        // Context 업데이트
                        if (result) {
                          if (result.assets) {
                            setAssets(result.assets);
                            setAssetStamp(Date.now()); // 에셋 교체 시 스탬프 갱신
                          }
                          if (result.snapshots) {
                            setSnapshots(result.snapshots);
                          }
                          if (result.gameData) {
                            setGameData(result.gameData);
                          }

                          // 스냅샷 로그 갱신 콜백 (하위 호환성)
                          if (onSnapshotUpdate && result.snapshots) {
                            onSnapshotUpdate({ versions: result.snapshots });
                          }
                        }

                        close();
                      } catch (err) {
                        console.error("replace-asset failed:", err);
                        alert(err.message || "업로드 중 오류가 발생했습니다.");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>

                <div className="prompt-box-large">
                  <textarea
                    placeholder="수정 요구사항을 입력하세요"
                    className="asset-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="prompt-actions center">
                    <button
                      className="btn-primary"
                      onClick={handleSubmitPrompt}
                      disabled={uploading}
                    >
                      {uploading ? "처리 중..." : "요청 전송"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
