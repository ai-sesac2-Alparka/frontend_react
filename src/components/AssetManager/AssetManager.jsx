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
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [worldType, setWorldType] = useState("tileset");
  const [style, setStyle] = useState("pixel");
  const [aiLoading, setAiLoading] = useState(false);
  const [wizardJson, setWizardJson] = useState(null);
  const [applyDraft, setApplyDraft] = useState(false);
  const [draftApplyStatus, setDraftApplyStatus] = useState("");
  const audioRef = useRef(null);

  // Context의 assets 사용
  const assets = contextAssets || [];

  useEffect(() => {
    if (!projectId && !gameTitle?.trim()) return;
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
  }, [gameTitle, projectId]); // 식별자 의존

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

  const fetchBlobFromUrl = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("생성된 에셋을 가져오지 못했습니다.");
    const blob = await res.blob();
    const filename = url.split("/").pop() || "generated";
    return new File([blob], filename, {
      type: blob.type || "application/octet-stream",
    });
  };

  const inferTypeFromBlob = (blob) => {
    if (blob.type?.includes("png") || blob.type?.includes("jpeg"))
      return "image";
    if (blob.type?.includes("json")) return "json";
    if (blob.type?.includes("audio")) return "sound";
    return "raw";
  };

  const handleUploadAsset = async ({ file, type, name }) => {
    await quadrakillAdapter.assets.upload({
      file,
      type,
      projectId,
      name: name || file.name,
    });
    const result = await fetchAssets();
    if (result) {
      setAssets(result);
      setAssetStamp(Date.now());
    }
  };

  const handleGenerate2D = async () => {
    if (!projectId) {
      alert("projectId가 필요합니다.");
      return;
    }
    if (!generationPrompt.trim()) {
      alert("프롬프트를 입력해주세요.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await quadrakillAdapter.ai2d.spriteSheet(
        generationPrompt.trim(),
        style,
        worldType,
      );
      const data = res?.data || {};
      const url =
        data.url ||
        data.image_url ||
        data.sprite_sheet_url ||
        data.spriteSheetUrl;
      if (!url) {
        throw new Error("생성 결과에서 이미지 URL을 찾지 못했습니다.");
      }
      const file = await fetchBlobFromUrl(url);
      const resolvedType = inferTypeFromBlob(file);
      if (resolvedType !== "image" && resolvedType !== "raw") {
        throw new Error(
          `지원하지 않는 MIME(${file.type || "unknown"}) 결과입니다.`,
        );
      }
      await handleUploadAsset({ file, type: resolvedType, name: file.name });
    } catch (err) {
      console.error(err);
      alert(err.message || "2D 생성/업로드에 실패했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleWizardConstruct = async () => {
    if (!projectId) {
      alert("projectId가 필요합니다.");
      return;
    }
    if (!generationPrompt.trim()) {
      alert("프롬프트를 입력해주세요.");
      return;
    }
    setAiLoading(true);
    try {
      const draftRes = await quadrakillAdapter.wizard.draft(
        generationPrompt.trim(),
        [],
      );
      const options = draftRes?.data?.options || draftRes?.data || {};
      const constructRes = await quadrakillAdapter.wizard.construct(
        options,
        "3d",
        "LOW",
        2048,
      );

      // construct 응답이 JSON(ecs/scene)일 때 파일 업로드 시도
      const constructData = constructRes?.data || constructRes;
      setWizardJson(constructData);

      if (constructData && typeof constructData === "object") {
        const serialized = JSON.stringify(constructData, null, 2);
        const file = new File([serialized], `wizard-${Date.now()}.json`, {
          type: "application/json",
        });
        await handleUploadAsset({
          file,
          type: "json",
          name: file.name,
        });

        if (applyDraft) {
          try {
            setDraftApplyStatus("Draft 적용 중…");
            await quadrakillAdapter.projects.updateDraft(
              projectId,
              constructData,
            );
            const updatedAssets = await fetchAssets();
            if (updatedAssets) {
              setAssets(updatedAssets);
              setAssetStamp(Date.now());
            }
            setDraftApplyStatus("Draft 저장 완료");
          } catch (draftErr) {
            console.error(draftErr);
            setDraftApplyStatus("Draft 저장 실패");
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "플랜/구성 생성에 실패했습니다.");
    } finally {
      setAiLoading(false);
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
          {/* 생성/업로드 패널 */}
          <section className="asset-section">
            <h3 className="section-title">AI 생성</h3>
            <div className="generator-box">
              <textarea
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="게임 콘셉트나 원하는 에셋 설명을 입력하세요"
                className="asset-prompt"
              />
              <div className="generator-controls">
                <label>
                  world_type
                  <select
                    value={worldType}
                    onChange={(e) => setWorldType(e.target.value)}
                  >
                    <option value="tileset">tileset</option>
                    <option value="isometric">isometric</option>
                    <option value="room">room</option>
                    <option value="board">board</option>
                    <option value="scrolling_bg">scrolling_bg</option>
                    <option value="parallax">parallax</option>
                  </select>
                </label>
                <label>
                  style
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    <option value="pixel">pixel</option>
                    <option value="toon">toon</option>
                    <option value="realistic">realistic</option>
                  </select>
                </label>
                <div className="generator-actions">
                  <button
                    className="btn-primary"
                    onClick={handleGenerate2D}
                    disabled={aiLoading}
                  >
                    {aiLoading ? "생성 중…" : "2D 생성+업로드"}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleWizardConstruct}
                    disabled={aiLoading}
                  >
                    {aiLoading ? "생성 중…" : "플랜/ECS 생성"}
                  </button>
                </div>
                <label
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={applyDraft}
                    onChange={(e) => setApplyDraft(e.target.checked)}
                  />
                  생성된 JSON을 draft(working_data)로 바로 저장
                </label>
                {draftApplyStatus && (
                  <div className="draft-status">{draftApplyStatus}</div>
                )}
              </div>
              {wizardJson && (
                <pre className="wizard-preview">
                  {JSON.stringify(wizardJson, null, 2)}
                </pre>
              )}
            </div>
          </section>
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
