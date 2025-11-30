import React, { useState } from 'react';
import './AssetManager.css';

export default function AssetManager({ assets = [], onAssetsChange = () => {}, onPromptSubmit = () => {} }) {
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState('');

  const open = (asset) => {
    setSelected(asset);
    setPrompt('');
  };
  const close = () => setSelected(null);

  const handleSubmitPrompt = () => {
    if (!prompt.trim()) return;
    // 전달: 부모(GameStudio)에서 ChatPanel로 포워딩
    onPromptSubmit(prompt.trim(), selected);
    setPrompt('');
    close();
  };

  return (
    <div className="asset-manager">
      <div className="assets-grid">
        {assets.map((a) => (
          <div key={a.id} className="asset-item" onClick={() => open(a)} role="button" tabIndex={0}>
            <div className="asset-preview">
              {a.type === 'image' && a.src ? (
                <img src={a.src} alt={a.name} />
              ) : a.type === 'audio' ? (
                <div className="audio-placeholder">🎵</div>
              ) : (
                <div className="asset-empty" />
              )}
            </div>
            <div className="asset-name">{a.name}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="asset-modal-overlay" onClick={close}>
          <div className="asset-modal" onClick={(e) => e.stopPropagation()}>
            <button className="asset-modal-x" aria-label="닫기" onClick={close}>×</button>
            <h3 className="asset-modal-title">{selected.name}</h3>
            <div className="asset-modal-body">
              <div className="asset-modal-preview-large">
                {selected.type === 'image' && selected.src ? (
                  <img src={selected.src} alt={selected.name} />
                ) : selected.type === 'audio' ? (
                  <div className="audio-preview-large">🎵 오디오 미리듣기</div>
                ) : (
                  <div style={{ padding: 20 }}>미리보기 없음</div>
                )}
              </div>
              <div className="asset-modal-controls">
                <label className="upload-label">
                  파일 선택
                  <input type="file" className="asset-file-input" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    // 간단히 교체 처리: 부모에 알림
                    onAssetsChange((prev) => prev.map((it) => it.id === selected.id ? { ...it, src: url, name: file.name } : it));
                  }} />
                </label>

                <div className="prompt-box-large">
                  <textarea
                    placeholder="수정 요구사항을 입력하세요"
                    className="asset-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="prompt-actions center">
                    <button className="btn-primary" onClick={handleSubmitPrompt}>요청 전송</button>
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
