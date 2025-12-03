import React, { useState, useEffect, useRef } from "react";
import "./AssetManager.css";
import { useGame } from "../../contexts/GameContext";
import { useAssets } from "../../hooks/useAssets";

export default function AssetManager({
  onPromptSubmit = () => {},
  onSnapshotUpdate = null,
}) {
  const {
    gameName,
    assets: contextAssets,
    setAssets,
    setSnapshots,
    setGameData,
    assetStamp,
    setAssetStamp,
  } = useGame();
  const { loading, error, fetchAssets, replaceAndRefresh } =
    useAssets(gameName);

  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef(null);

  // Context의 assets 사용
  const assets = contextAssets || [];

  useEffect(() => {
    if (!gameName || !gameName.trim()) return;
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
  }, [gameName]); // gameName만 의존성으로 설정

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
              {assets.filter((a) => a.type === "sound").length === 0 && (
                <div className="empty-message">사운드가 없습니다.</div>
              )}
              {assets
                .filter((a) => a.type === "sound")
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
      )}

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
