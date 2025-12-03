import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/reset.css';        // ⭐ 추가
import './styles/variables.css';    // ⭐ 추가
import './styles/common.css';       // ⭐ 추가
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Inject global fonts to avoid per-page timing issues
const __globalFontStyle = document.createElement('style');
__globalFontStyle.id = 'global-fonts';
__globalFontStyle.innerHTML = `
@font-face { font-family: 'Paperlogy-5'; src: url("${process.env.PUBLIC_URL}/fonts/Paperlogy-5Medium.ttf") format('truetype'); font-weight: 500 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'HSSanTokki2'; src: url("${process.env.PUBLIC_URL}/fonts/HSSanTokki2.0(2024).ttf") format('truetype'); font-weight: 300 700; font-style: normal; font-display: swap; }
`;
document.head.appendChild(__globalFontStyle);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
