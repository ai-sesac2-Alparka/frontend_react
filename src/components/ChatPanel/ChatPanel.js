import React, { useState, useEffect } from 'react';
import './ChatPanel.css';

export default function ChatPanel({ initialMessages = [], onReady = null }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  // 함수: 외부에서 메시지를 추가할 때 사용
  const addMessage = (msg) => {
    setMessages((m) => [...m, msg]);
  };

  useEffect(() => {
    if (typeof onReady === 'function') {
      onReady(addMessage);
    }
  }, [onReady]);

  const send = () => {
    if (!input.trim()) return;
    addMessage({ type: 'user', text: input });
    setInput('');
    setTimeout(() => {
      addMessage({ type: 'ai', text: '응답 (샘플)' });
    }, 600);
  };

  const bgUrl = (process.env.PUBLIC_URL || '') + '/images/background.svg';

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>AI 도우미🧚🏻‍♀️</h3>
      </div>
      <div className="chat-messages" style={{ backgroundImage: `url(${bgUrl})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: 'cover' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={send}>전송</button>
      </div>
    </div>
  );
}
