import React, { useMemo, useState, useRef, useEffect } from "react";
import "./SnapshotTree.css";
import { useSnapshotTree } from "../hooks/useSnapshotTree";
import { useGame } from "../contexts/GameContext";

// 버전 배열을 트리(루트들)로 변환
function buildTree(versions) {
  const map = new Map();
  versions.forEach((v) => {
    map.set(v.version, { ...v, children: [] });
  });
  const roots = [];
  versions.forEach((v) => {
    const node = map.get(v.version);
    if (v.parent) {
      const parent = map.get(v.parent);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortByTime = (a, b) => new Date(a.timestamp) - new Date(b.timestamp);
  const sortRec = (n) => {
    n.children.sort(sortByTime);
    n.children.forEach(sortRec);
  };
  roots.sort(sortByTime);
  roots.forEach(sortRec);
  return roots;
}

// 간단한 계층 레이아웃: 리프를 위에서 아래로 배치하고 내부 노드는 자식의 평균 y
// 수직 레이아웃(위→아래): y는 depth 기반, x는 리프 순서/자식 평균
function layoutTreeVertical(roots, hGap = 110, vGap = 110, margin = 50) {
  let xCounter = 0; // 리프별 가로 위치 증가
  const nodes = [];
  const edges = [];
  let maxDepth = 0;

  function dfs(node, depth) {
    maxDepth = Math.max(maxDepth, depth);
    node.depth = depth;
    if (!node.children || node.children.length === 0) {
      node._tx = xCounter * hGap;
      xCounter += 1;
    } else {
      node.children.forEach((ch) => dfs(ch, depth + 1));
      const avg =
        node.children.reduce((s, c) => s + c._tx, 0) / node.children.length;
      node._tx = avg;
    }
    nodes.push(node);
    if (node.children) node.children.forEach((ch) => edges.push([node, ch]));
  }

  roots.forEach((r) => dfs(r, 0));

  const minX = Math.min(...nodes.map((n) => n._tx));
  const maxX = Math.max(...nodes.map((n) => n._tx));
  // 라벨 텍스트와 여백이 우측에서 잘리지 않도록 추가 패딩
  const rightLabelPadding = 120; // 라벨 대략 길이만큼 확보
  const width = margin * 2 + (maxX - minX || hGap) + rightLabelPadding;
  const height = margin * 2 + maxDepth * vGap;

  const placed = nodes.map((n) => ({
    ...n,
    x: margin + (n._tx - minX),
    y: margin + n.depth * vGap,
  }));

  const placedMap = new Map(placed.map((n) => [n.version, n]));
  const placedEdges = edges.map(([p, c]) => [
    placedMap.get(p.version),
    placedMap.get(c.version),
  ]);
  return { width, height, nodes: placed, edges: placedEdges };
}

export default function SnapshotTree({ gameName, showImportExport = true }) {
  // Context에서 snapshots 가져오기
  const { snapshots: contextSnapshots } = useGame();

  // Hook 사용: 스냅샷 관리 (게임 데이터 갱신 포함)
  const {
    versions: hookVersions,
    restoreAndRefresh: restoreSnapshot,
    fetchSnapshots,
  } = useSnapshotTree(gameName);

  const [customData, setCustomData] = useState(null);

  // Context의 snapshots, Hook의 versions, customData 우선순위로 사용
  const versions = customData?.versions || contextSnapshots || hookVersions;
  const [selected, setSelected] = useState(null); // 선택된 버전 오브젝트
  const [isApplying, setIsApplying] = useState(false);
  const fileRef = useRef(null);
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const wasDraggingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 0.7;
  const MAX_SCALE = 2.5;
  const [ctrlZoomEnabled, setCtrlZoomEnabled] = useState(false);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // 컴포넌트 마운트 시 스냅샷 로드
  useEffect(() => {
    if (gameName && !customData) {
      fetchSnapshots();
    }
  }, [gameName, customData, fetchSnapshots]);

  // 외부 data 혹은 업로드 데이터 변화에 따라 versions 상태 갱신
  const effectiveData = useMemo(
    () => (customData ? customData : { versions }),
    [customData, versions]
  );

  const roots = useMemo(
    () => buildTree(effectiveData?.versions || []),
    [effectiveData]
  );
  const { width, height, nodes, edges } = useMemo(
    () => layoutTreeVertical(roots),
    [roots]
  );

  // Zoom helpers available to UI and event handlers
  const doZoom = (e, wrap) => {
    const rect = wrap.getBoundingClientRect();
    const mouseXInView = e.clientX - rect.left;
    const mouseYInView = e.clientY - rect.top;
    const preContentX = (wrap.scrollLeft + mouseXInView) / scaleRef.current;
    const preContentY = (wrap.scrollTop + mouseYInView) / scaleRef.current;
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? 1.1 : 0.9;
    const next = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, scaleRef.current * factor)
    );
    if (next === scaleRef.current) return;
    setScale(next);
    requestAnimationFrame(() => {
      wrap.scrollLeft = preContentX * next - mouseXInView;
      wrap.scrollTop = preContentY * next - mouseYInView;
    });
  };

  const zoomByFactor = (factor) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const centerX = wrap.clientWidth / 2;
    const centerY = wrap.clientHeight / 2;
    const preContentX = (wrap.scrollLeft + centerX) / scaleRef.current;
    const preContentY = (wrap.scrollTop + centerY) / scaleRef.current;
    const next = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, scaleRef.current * factor)
    );
    if (next === scaleRef.current) return;
    setScale(next);
    requestAnimationFrame(() => {
      wrap.scrollLeft = preContentX * next - centerX;
      wrap.scrollTop = preContentY * next - centerY;
    });
  };

  const zoomIn = () => zoomByFactor(1.1);
  const zoomOut = () => zoomByFactor(0.9);

  // 초기 확대 비율: 콘텐츠가 래퍼보다 크면 최소 배율로 시작, 아니면 1로 시작
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      const cs = window.getComputedStyle(el);
      const padX =
        (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY =
        (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const availW = el.clientWidth - padX;
      const availH = el.clientHeight - padY;
      const needScrollX = width > availW;
      const needScrollY = height > availH;
      const next = needScrollX || needScrollY ? MIN_SCALE : 1;
      if (scaleRef.current !== next) {
        scaleRef.current = next;
        setScale(next);
      }
      // 초기 위치를 좌상단으로
      el.scrollLeft = 0;
      el.scrollTop = 0;
    } catch (_e) {
      // 측정 실패 시 무시
    }
  }, [width, height, versions]);

  // 스냅샷 갱신 시 현재 버전 노드를 중앙에 보이도록 스크롤 조정
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !nodes.length) return;
    const target =
      nodes.find((n) => n.is_current) ||
      nodes.find((n) => n.is_latest) ||
      nodes[0];
    if (!target) return;
    const s = scaleRef.current || 1;
    // 콘텐츠 좌표를 뷰 중앙에 위치시키기 위한 스크롤 계산
    const desiredLeft = Math.max(0, target.x * s - el.clientWidth / 2);
    const desiredTop = Math.max(0, target.y * s - el.clientHeight / 2);
    requestAnimationFrame(() => {
      el.scrollLeft = desiredLeft;
      el.scrollTop = desiredTop;
    });
  }, [nodes, scale]);

  // 드래그 패닝 관련 전역(mousemove/mouseup) 리스너 등록
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingRef.current) return;
      const el = wrapRef.current;
      if (!el) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        wasDraggingRef.current = true;
      }
      el.scrollLeft -= dx;
      el.scrollTop -= dy;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const el = wrapRef.current;
      if (el) el.classList.remove("dragging");
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 50);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  // Ctrl+휠 확대/축소를 위한 wheel 이벤트 리스너 (passive: false로 설정)
  useEffect(() => {
    // Track whether pointer is currently inside the graph area.
    const isPointerInsideRef = { current: false };
    const wrapEl = wrapRef.current;
    const enter = () => (isPointerInsideRef.current = true);
    const leave = () => (isPointerInsideRef.current = false);
    if (wrapEl) {
      wrapEl.addEventListener("pointerenter", enter);
      wrapEl.addEventListener("pointerleave", leave);
    }

    // (no-op here; helpers live in component scope)

    // Handler attached directly to the wrap element (non-passive) to try to prevent browser zoom
    const wrapWheelHandler = (e) => {
      // Only handle when Ctrl (or Meta on Mac) is pressed
      if (!e.ctrlKey && !e.metaKey) return;
      if (!isPointerInsideRef.current) return;
      // Prevent browser zoom/page scroll
      e.preventDefault();
      e.stopPropagation();
      const wrap = wrapRef.current;
      if (!wrap) return;
      doZoom(e, wrap);
    };

    // Fallback capture listeners on document/window in case wrap listener doesn't catch all cases
    const captureHandler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (!isPointerInsideRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      doZoom(e, wrap);
    };

    if (wrapEl) {
      // non-passive so we can call preventDefault
      wrapEl.addEventListener("wheel", wrapWheelHandler, { passive: false });
    }
    document.addEventListener("wheel", captureHandler, {
      passive: false,
      capture: true,
    });
    window.addEventListener("wheel", captureHandler, {
      passive: false,
      capture: true,
    });

    return () => {
      if (wrapEl) {
        wrapEl.removeEventListener("pointerenter", enter);
        wrapEl.removeEventListener("pointerleave", leave);
        wrapEl.removeEventListener("wheel", wrapWheelHandler, {
          passive: false,
        });
      }
      document.removeEventListener("wheel", captureHandler, { capture: true });
      window.removeEventListener("wheel", captureHandler, { capture: true });
    };
  }, []);

  // Overlay wheel handler when ctrlZoomEnabled is true
  useEffect(() => {
    if (!ctrlZoomEnabled) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.zIndex = "999";
    overlay.style.background = "transparent";
    // ensure it receives pointer events
    overlay.style.pointerEvents = "auto";
    overlay.tabIndex = -1;
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      doZoom(e, wrap);
    };
    overlay.addEventListener("wheel", handler, { passive: false });
    wrap.style.position = wrap.style.position || "relative";
    wrap.appendChild(overlay);
    return () => {
      overlay.removeEventListener("wheel", handler);
      try {
        wrap.removeChild(overlay);
      } catch {}
    };
  }, [ctrlZoomEnabled]);

  const beginDrag = (e) => {
    if (e.button !== 0) return;
    const el = wrapRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    el.classList.add("dragging");
    e.preventDefault();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (json?.versions && Array.isArray(json.versions)) {
          setCustomData(json);
        } else {
          alert("올바른 형식이 아닙니다. { versions: [...] } 필요");
        }
      } catch (err) {
        alert("JSON 파싱 오류: " + err.message);
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    try {
      const payload = JSON.stringify({ versions }, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "snapshots.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("내보내기 실패: " + err.message);
    }
  };

  if (!nodes.length) {
    return (
      <div className="snapshot-tree graph">
        {showImportExport && (
          <div className="st-toolbar">
            <button
              onClick={() => fileRef.current?.click()}
              style={{ fontFamily: "Paperlogy-5, sans-serif" }}
            >
              JSON 불러오기
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            {customData && (
              <button onClick={() => setCustomData(null)}>
                기본 데이터로 복원
              </button>
            )}
          </div>
        )}
        <div className="st-empty">스냅샷이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="snapshot-tree graph">
      {showImportExport && (
        <div className="st-toolbar">
          <button
            onClick={() => fileRef.current?.click()}
            style={{ fontFamily: "Paperlogy-5, sans-serif" }}
          >
            JSON 불러오기
          </button>
          <button onClick={handleExport}>JSON 내보내기</button>
          {/* Zoom controls for environments where Ctrl+wheel is captured by the browser */}
          <button onClick={() => zoomIn()} title="Zoom In">
            +
          </button>
          <button onClick={() => zoomOut()} title="Zoom Out">
            −
          </button>

          <button
            onClick={() => setCtrlZoomEnabled((v) => !v)}
            title="Toggle Ctrl Zoom Mode"
            style={{ background: ctrlZoomEnabled ? "#ddd" : "transparent" }}
          >
            {ctrlZoomEnabled ? "Ctrl Zoom: ON" : "Ctrl Zoom: OFF"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          {customData && (
            <div className="st-toolbar-right">
              <button
                onClick={() => {
                  setCustomData(null);
                  setSelected(null);
                  fetchSnapshots();
                }}
              >
                기본 데이터로 복원
              </button>
            </div>
          )}
        </div>
      )}
      <div className="st-graph-wrap" ref={wrapRef} onMouseDown={beginDrag}>
        <div
          className="st-canvas"
          style={{
            width: width,
            height: height,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg width={width} height={height}>
            <g className="st-edges">
              {edges.map(([p, c], idx) => (
                <path
                  key={idx}
                  d={`M ${p.x} ${p.y} C ${p.x} ${(p.y + c.y) / 2}, ${c.x} ${
                    (p.y + c.y) / 2
                  }, ${c.x} ${c.y}`}
                  className="st-edge curved"
                />
              ))}
            </g>
            <g className="st-nodes">
              {nodes.map((n) => {
                <div style={{ marginBottom: 8, fontSize: 11, color: "#555" }}>
                  드래그로 이동 / Ctrl+휠로 확대·축소 (배율 {scale.toFixed(2)}x)
                </div>;
                const baseCircleClass = `st-node ${
                  n.is_current ? "current" : ""
                } ${!n.is_current && n.is_latest ? "latest" : ""}`.trim();
                return (
                  <g
                    key={n.version}
                    className="st-node-g"
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => {
                      if (!wasDraggingRef.current) setSelected(n);
                    }}
                  >
                    <circle r={20} className={baseCircleClass} />
                    {n.is_current && (
                      <circle r={12} className="st-node-current-dot" />
                    )}
                    <text className="st-label" x={26} y={2}>
                      {n.version}
                    </text>
                    <text className="st-sub" x={26} y={18}>
                      {(() => {
                        try {
                          const d = new Date(n.timestamp);
                          return d.toLocaleString();
                        } catch {
                          return n.timestamp;
                        }
                      })()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {selected && (
        <div className="st-detail">
          <div className="st-detail-header">
            <strong>{selected.version}</strong>
            <button
              className="st-detail-close"
              onClick={() => setSelected(null)}
            >
              닫기
            </button>
          </div>
          <div className="st-detail-body">
            <div>
              <b>요청:</b> {selected.summary || "(요약 없음)"}
            </div>
            <div>
              <b>버전:</b> {selected.version}
            </div>
            <div>
              <b>부모:</b> {selected.parent ?? "(없음)"}
            </div>
            <div>
              <b>시간:</b>{" "}
              {(() => {
                try {
                  const d = new Date(selected.timestamp);
                  return d.toLocaleString();
                } catch {
                  return selected.timestamp;
                }
              })()}
            </div>
            <div>
              <b>현재 여부:</b> {selected.is_current ? "true" : "false"}
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                disabled={isApplying}
                onClick={async () => {
                  if (!selected) return;
                  setIsApplying(true);
                  try {
                    // Hook을 사용하여 버전 복원 및 스냅샷 갱신
                    const restoredVersion = await restoreSnapshot(
                      selected.version
                    );

                    if (restoredVersion) {
                      // 선택된 버전 업데이트 (Hook이 자동으로 게임 데이터도 갱신함)
                      setSelected(restoredVersion);
                    } else {
                      console.warn("버전 복원에 실패했습니다.");
                    }
                  } catch (err) {
                    console.error("버전 복원 중 오류:", err);
                    alert("버전 복원 중 오류가 발생했습니다.");
                  } finally {
                    setIsApplying(false);
                  }
                }}
              >
                {isApplying ? "적용 중…" : "현재 버전으로 설정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
