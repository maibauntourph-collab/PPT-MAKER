/** @type {import('tailwindcss').Config} */
// 📦 Tailwind CSS 설정 파일
// 담당: 킴 디자이너
// 설명: Tailwind CSS가 어떤 파일에서 클래스를 찾을지 지정합니다.
export default {
    // content: Tailwind가 사용하지 않는 CSS를 제거(Tree-shake)할 때 스캔할 파일 경로
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 커스텀 폰트 패밀리 등록 (Google Fonts 'Pretendard' 스타일 대체)
            fontFamily: {
                sans: ['Noto Sans KR', 'sans-serif'],
            },
            // 커스텀 애니메이션 키프레임 (별/파티클 효과)
            keyframes: {
                twinkle: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.3', transform: 'scale(0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            animation: {
                twinkle: 'twinkle 2s ease-in-out infinite',
                float: 'float 3s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
