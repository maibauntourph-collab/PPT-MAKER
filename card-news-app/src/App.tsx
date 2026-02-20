// 📦 최상위 App 컴포넌트 — 라우팅 설정
// 담당: 🚢 나비게이터 킴 (라우팅 전문가)
// 설명: 이 파일은 "어느 URL에서 어느 페이지를 보여줄지"를 결정합니다.
//
// 핵심 개념:
// - BrowserRouter: URL 기반 라우팅을 사용 (예: /story)
// - Routes / Route: 조건부 컴포넌트 렌더링 (URL에 따라 다른 Page를 보여줌)
// - AnimatePresence: 페이지가 사라질(unmount) 때 Framer Motion 애니메이션을 실행할 수 있게 해주는 래퍼
// - useLocation: 현재 URL 정보를 가져옵니다. key로 사용하여 경로가 바뀔 때마다 새 애니메이션을 실행

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import IntroPage from './pages/IntroPage'
import StoryPage from './pages/StoryPage'
import GeneratorPage from './pages/GeneratorPage' // 추가
import { CardProvider } from './context/CardContext' // 추가

// 🎨 AnimatePresence는 자식 컴포넌트의 라우트 변경을 감지해야 하므로,
//    실제 Routes를 감싸는 별도 컴포넌트로 분리합니다.
function AnimatedRoutes() {
  const location = useLocation()

  return (
    // mode="wait": 현재 페이지의 퇴장(exit) 애니메이션이 끝난 후, 다음 페이지의 진입(enter) 애니메이션 시작
    <AnimatePresence mode="wait">
      {/* key={location.pathname}: URL이 바뀔 때마다 AnimatePresence가 새 자식이 들어왔음을 감지 */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<IntroPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/generate" element={<GeneratorPage />} /> {/* 라우트 추가 */}
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CardProvider> {/* 전역 상태 공급 */}
        <div className="app-container font-sans text-white">
          <AnimatedRoutes />
        </div>
      </CardProvider>
    </BrowserRouter>
  )
}
