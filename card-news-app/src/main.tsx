// 📦 React 앱의 진입점 (Entry Point)
// 담당: 도다리 (총괄 기획)
// 설명: React 앱을 HTML의 root div에 마운트합니다.
// StrictMode: 개발 환경에서 잠재적 문제를 미리 감지해주는 래퍼 컴포넌트

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// document.getElementById('root')! 에서 '!'는 "이 값이 null이 아님을 보장한다"는 TypeScript 문법
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
