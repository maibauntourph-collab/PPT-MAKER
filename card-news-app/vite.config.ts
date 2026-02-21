// 📦 Vite 빌드 도구 설정 파일
// 담당: 도다리 (총괄 기획)
// 설명: Vite는 차세대 프론트엔드 빌드 도구입니다.
//
// 🎓 Vite란?
//   - 개발 서버: 코드 변경 시 브라우저에 즉시 반영 (HMR: Hot Module Replacement)
//   - 빌드 도구: 배포용 최적화된 번들(파일 묶음)을 생성합니다.
//   - Webpack보다 훨씬 빠르며, ES Modules를 네이티브로 활용합니다.
//
// 📌 참고: https://vite.dev/config/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// defineConfig: TypeScript 자동 완성을 위한 헬퍼 함수
export default defineConfig({
  plugins: [
    react(), // React JSX 변환 및 Fast Refresh(즉시 반영) 기능 활성화
  ],
})

