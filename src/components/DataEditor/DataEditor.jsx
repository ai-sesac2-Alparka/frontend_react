import React, { useRef, useState } from "react";
import "./DataEditor.css";
import { useGameData } from "../../hooks/useGameData";
import { useGame } from "../../contexts/GameContext";

/*
  DataEditor: 간단한 key-value JSON 편집기
  기능:
  - JSON 파일 불러오기 (input type=file)
  - 현재 상태를 JSON 다운로드
  - 키/타입은 변경 불가(값만 수정)
  - 값 타입: number / boolean / string (가져오기 시 고정)
  - 숫자 필드는 숫자만 입력
  - 가져오기/내보내기 지원
*/

// 제거된: 이전 top-level 편집기 유틸

// Leaf 판단
// leaf 판별은 직접 사용하지 않아 제거

const classifyType = (val) => {
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  return "string";
};

// 재귀 편집 컴포넌트
const depthColors = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5"];
const getDepthStyle = (depth) => ({
  borderLeft: `4px solid ${depthColors[depth % depthColors.length]}`,
  backgroundColor: depth % 2 === 0 ? "#fbfbfb" : "#ffffff",
});

const CollapsibleNode = ({ label, typeLabel, depth, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="collapsible-node"
      style={{
        ...getDepthStyle(depth),
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
      }}
    >
      <div
        className="node-header"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <span className="caret" style={{ width: 16 }}>
          {open ? "▼" : "▶"}
        </span>
        <strong className="node-label" style={{ flex: 1 }}>
          {label}
        </strong>
        {typeLabel && (
          <span className="type-badge" style={{ fontSize: 12, color: "#555" }}>
            {typeLabel}
          </span>
        )}
      </div>
      {open && (
        <div className="node-body" style={{ marginTop: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
};

const NodeEditor = ({
  path,
  value,
  onChange,
  depth = 0,
  label,
  hiddenTopLevelKeys = [],
}) => {
  // 객체
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const allKeys = Object.keys(value);
    const keys =
      depth === 0 && hiddenTopLevelKeys && hiddenTopLevelKeys.length
        ? allKeys.filter((k) => !hiddenTopLevelKeys.includes(k))
        : allKeys;
    return (
      <div className="node object-node">
        {keys.map((k) => {
          const child = value[k];
          const isGroup = child && typeof child === "object";
          if (isGroup) {
            return (
              <CollapsibleNode
                key={k}
                label={k}
                typeLabel={
                  Array.isArray(child) ? `array(${child.length})` : "object"
                }
                depth={depth}
              >
                <NodeEditor
                  path={[...path, k]}
                  value={child}
                  onChange={onChange}
                  depth={depth + 1}
                  label={k}
                  hiddenTopLevelKeys={hiddenTopLevelKeys}
                />
              </CollapsibleNode>
            );
          }
          // leaf는 접기/펼치기 없이 바로 표시
          return (
            <NodeEditor
              key={k}
              path={[...path, k]}
              value={child}
              onChange={onChange}
              depth={depth}
              label={k}
              hiddenTopLevelKeys={hiddenTopLevelKeys}
            />
          );
        })}
      </div>
    );
  }
  // 배열
  if (Array.isArray(value)) {
    return (
      <div className="node array-node">
        {value.map((item, idx) => {
          const isGroup = item && typeof item === "object";
          if (isGroup) {
            return (
              <CollapsibleNode
                key={idx}
                label={`[${idx}]`}
                typeLabel={
                  Array.isArray(item) ? `array(${item.length})` : "object"
                }
                depth={depth}
              >
                <NodeEditor
                  path={[...path, idx]}
                  value={item}
                  onChange={onChange}
                  depth={depth + 1}
                  label={`[${idx}]`}
                  hiddenTopLevelKeys={hiddenTopLevelKeys}
                />
              </CollapsibleNode>
            );
          }
          // leaf는 접기/펼치기 없이 바로 표시
          return (
            <NodeEditor
              key={idx}
              path={[...path, idx]}
              value={item}
              onChange={onChange}
              depth={depth}
              label={`[${idx}]`}
              hiddenTopLevelKeys={hiddenTopLevelKeys}
            />
          );
        })}
      </div>
    );
  }
  // Leaf 값 편집
  const type = classifyType(value);
  const handleValueChange = (raw) => {
    let newVal = raw;
    if (type === "number") {
      newVal = raw === "" ? "" : Number(raw);
    } else if (type === "boolean") {
      newVal = raw === "true";
    }
    onChange(path, newVal);
  };
  return (
    <div
      className="leaf-line"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div className="leaf-key" style={{ color: "#333" }}>
        {label}
      </div>
      <div className="leaf-editor">
        {type === "boolean" ? (
          <select
            value={String(value)}
            onChange={(e) => handleValueChange(e.target.value)}
            aria-label={label || "value"}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type={type === "number" ? "number" : "text"}
            value={value === undefined || value === null ? "" : value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={type === "number" ? "0" : "value"}
            aria-label={label || "value"}
          />
        )}
      </div>
    </div>
  );
};

function DataEditor({
  data,
  onDataChange,
  showImportExport = true,
  gameName,
  projectId,
  hiddenTopLevelKeys = [],
}) {
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [metaFilter, setMetaFilter] = useState("");
  const [metaTypeFilter, setMetaTypeFilter] = useState("all");

  // Context에서 gameData 가져오기 및 업데이트 함수
  const {
    gameData: contextGameData,
    setGameData,
    setSnapshots,
    setAssets,
    setAssetStamp,
    projectId: contextProjectId,
  } = useGame();

  const target = React.useMemo(
    () => ({
      gameName,
      projectId: projectId || contextProjectId,
    }),
    [gameName, projectId, contextProjectId],
  );

  // Hook 사용: 게임 데이터 관리 (스냅샷 갱신 포함)
  const { saveAndRefresh } = useGameData(target);
  // JSON 미리보기 기능 비활성화 (상태 제거)

  // Context의 gameData를 우선 사용, 없으면 props의 data 사용
  const effectiveData = data || contextGameData;

  const setValueAtPath = (path, newVal) => {
    onDataChange((prev) => {
      const base = typeof prev === "object" && prev !== null ? prev : {};
      const clone = structuredClone(base);
      let cur = clone;
      for (let i = 0; i < path.length - 1; i++) {
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = newVal;
      return clone;
    });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (json && typeof json === "object") {
          onDataChange(json);
        }
      } catch (err) {
        alert("JSON 파싱 오류: " + err.message);
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const buildObject = () => effectiveData;
  const metaEntries =
    effectiveData && typeof effectiveData === "object" && effectiveData.assets
      ? [
          ...(effectiveData.assets.files || []),
          ...(effectiveData.assets.images || []),
          ...(effectiveData.assets.sounds || []),
        ]
      : [];
  const filteredMeta = metaEntries.filter((m) => {
    const textMatch = metaFilter
      ? JSON.stringify(m).toLowerCase().includes(metaFilter.toLowerCase())
      : true;
    const type = (m.asset_type || m.type || "").toLowerCase();
    const typeMatch =
      metaTypeFilter === "all" ||
      (metaTypeFilter === "image" && type.includes("image")) ||
      (metaTypeFilter === "sound" && type.includes("sound")) ||
      (metaTypeFilter === "file" &&
        !type.includes("image") &&
        !type.includes("sound"));
    return textMatch && typeMatch;
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(buildObject(), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 저장 실행 핸들러: Hook을 통한 데이터 저장 및 Context 업데이트
  const handleSave = async () => {
    if (isSaving) return;
    if (!target.gameName?.trim() && !target.projectId) {
      alert("게임 또는 프로젝트 식별자가 필요합니다.");
      return;
    }
    if (effectiveData === undefined || effectiveData === null) {
      alert("보낼 데이터가 없습니다.");
      return;
    }
    try {
      setIsSaving(true);

      // Hook을 사용하여 데이터 저장 및 스냅샷 자동 갱신
      const result = await saveAndRefresh(effectiveData);

      // Context 업데이트
      if (result) {
        if (result.gameData) {
          setGameData(result.gameData);
        }
        if (result.snapshots) {
          setSnapshots(result.snapshots);
        }
        if (result.assets) {
          // 에셋 데이터를 Context에 맞는 형식으로 변환
          const backendUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
          const images = Array.isArray(result.assets.images)
            ? result.assets.images.map((img, idx) => ({
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
          const sounds = Array.isArray(result.assets.sounds)
            ? result.assets.sounds.map((snd, idx) => ({
                id: `snd-${idx}`,
                type: "sound",
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
          setAssetStamp(Date.now()); // 데이터 저장 시 스탬프 갱신
        }
      }
    } catch (err) {
      console.error("데이터 저장 중 오류:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="data-editor-container">
      <div
        className="data-editor-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>⚙️게임 설정 편집</h2>
        <div
          className="data-editor-actions"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {showImportExport && (
            <>
              <button onClick={() => fileInputRef.current?.click()}>
                가져오기(JSON)
              </button>
              <button onClick={handleExport}>내보내기(JSON)</button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </>
          )}
          {/* JSON 미리보기 토글 버튼 숨김 */}
          <button
            onClick={handleSave}
            disabled={isSaving || (!gameName?.trim() && !target.projectId)}
            title={
              !gameName?.trim() && !target.projectId
                ? "게임 또는 프로젝트 식별자가 필요합니다"
                : "현재 데이터 저장"
            }
          >
            {isSaving ? "저장 중…" : "변경 내용 저장"}
          </button>
          <button onClick={() => setShowMeta((v) => !v)}>
            {showMeta ? "메타 숨기기" : "메타 보기"}
          </button>
        </div>
      </div>
      <div className="hierarchy-editor">
        <NodeEditor
          path={[]}
          value={effectiveData}
          onChange={setValueAtPath}
          depth={0}
          hiddenTopLevelKeys={hiddenTopLevelKeys}
        />
      </div>
      {showMeta && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>자산 메타 보기</strong>
            <input
              type="text"
              placeholder="경로/체크섬/타입 검색"
              value={metaFilter}
              onChange={(e) => setMetaFilter(e.target.value)}
            />
            <select
              value={metaTypeFilter}
              onChange={(e) => setMetaTypeFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="image">이미지</option>
              <option value="sound">사운드</option>
              <option value="file">파일</option>
            </select>
          </div>
          <ul style={{ marginTop: 8, maxHeight: 200, overflow: "auto" }}>
            {filteredMeta.length === 0 && <li>메타 정보가 없습니다.</li>}
            {filteredMeta.map((m, idx) => (
              <li key={idx} style={{ fontSize: 12, marginBottom: 6 }}>
                <div>
                  <strong>{m.name || m.logical_name || "asset"}</strong>{" "}
                  {m.asset_type || m.type || ""}
                </div>
                {m.storage_path && (
                  <div>
                    경로: {m.storage_path}{" "}
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(m.storage_path)
                      }
                    >
                      복사
                    </button>
                  </div>
                )}
                {m.metadata?.checksum_sha256 && (
                  <div>
                    SHA256: {m.metadata.checksum_sha256.slice(0, 12)}…{" "}
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          m.metadata.checksum_sha256,
                        )
                      }
                    >
                      복사
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DataEditor;
