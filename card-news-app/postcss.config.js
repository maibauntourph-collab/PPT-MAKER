/* 📦 PostCSS 설정 파일
   담당: 킴 디자이너
   설명: Tailwind CSS 와 Autoprefixer 플러그인을 PostCSS에 연결합니다.
   Autoprefixer는 -webkit-, -moz- 같은 브라우저 접두사를 자동으로 추가해줍니다. */
export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
}
