import React, { useState, useEffect, useRef } from "react";
import "./AssetManager.css";
import { getGameAssets, replaceAsset, getSnapshotLog } from "../../api/backend";
import { useGame } from "../../contexts/GameContext";

export default function AssetManager({
  onPromptSubmit = () => {},
  onSnapshotUpdate = null,
}) {
  const { gameTitle, assets, setAssets } = useGame();
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [assetStamp, setAssetStamp] = useState(0);
  const fileInputRef = useRef(null);
  const didFetchRef = useRef(false);

  const fetchAssets = async () => {
    if (!gameTitle || !gameTitle.trim()) {
      setAssets([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await getGameAssets(gameTitle);
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

      setAssets([...images, ...sounds]);
      setAssetStamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("에셋 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameTitle || !gameTitle.trim()) return;
    if (didFetchRef.current) return;

    didFetchRef.current = true;
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameTitle]);

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

  return (
    <div className="asset-manager">
      {error && (
        <div className="asset-error" style={{ padding: 16, color: "red" }}>
          {error}
        </div>
      )}
      {loading && <div style={{ padding: 16 }}>로딩 중...</div>}

      <div className="asset-sections-container">
        {/* 이미지 섹션 */}
        <section className="asset-section">
          <h3 className="section-title">이미지</h3>
          <div className="assets-grid">
            {assets.filter((a) => a.type === "image").length === 0 && (
              <div className="empty-message">이미지가 없습니다.</div>
            )}
            {assets
              .filter((a) => a.type === "image")
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
                    <div className="asset-name">{a.name}</div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* 사운드 섹션 */}
        <section className="asset-section">
          <h3 className="section-title">사운드</h3>
          <div className="assets-grid">
            {assets.filter((a) => a.type === "audio").length === 0 && (
              <div className="empty-message">사운드가 없습니다.</div>
            )}
            {assets
              .filter((a) => a.type === "audio")
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
                    <div className="asset-name">{a.name}</div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {selected && (
        <div className="asset-modal-overlay" onClick={close}>
          <div className="asset-modal" onClick={(e) => e.stopPropagation()}>
            <button className="asset-modal-x" aria-label="닫기" onClick={close}>
              ×
            </button>
            <h3 className="asset-modal-title">{selected.name}</h3>
            <div className="asset-modal-body">
              <div className="asset-modal-preview-large">
                {selected.type === "image" && selected.src ? (
                  <img src={selected.src} alt={selected.name} />
                ) : selected.type === "audio" && selected.src ? (
                  <audio
                    controls
                    src={selected.src}
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
                    ref={fileInputRef}
                    type="file"
                    className="asset-file-input"
                    accept={
                      selected.type === "image" ? "image/*" : "audio/mpeg,.mp3"
                    }
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (selected.type === "audio") {
                        const nameLower = file.name.toLowerCase();
                        if (!nameLower.endsWith(".mp3")) {
                          alert("사운드 교체는 MP3 파일만 가능합니다.");
                          return;
                        }
                      }

                      try {
                        setUploading(true);
                        await replaceAsset(gameTitle, selected, file);
                        await fetchAssets();

                        const newStamp = Date.now();
                        setAssetStamp(newStamp);

                        // 스냅샷 로그 갱신
                        try {
                          if (onSnapshotUpdate) {
                            const snapRes = await getSnapshotLog(gameTitle);
                            const data = snapRes?.data;
                            if (data) onSnapshotUpdate(data);
                          }
                        } catch (snapErr) {
                          console.error(
                            "Failed to refresh snapshot-log:",
                            snapErr
                          );
                        }

                        alert("에셋이 교체되었습니다.");
                        close();
                      } catch (err) {
                        console.error("replace-asset failed:", err);
                        alert("업로드 중 오류가 발생했습니다.");
                      } finally {
                        setUploading(false);
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
