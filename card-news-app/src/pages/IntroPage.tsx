// 📦 랜딩 페이지 (Intro Page) — 리디자인 v2
// 담당: 🎨 킴 디자이너 + 🤖 오토메이션 박사
// 설명: 사용자가 처음 만나는 화면입니다.
//       두 개의 대형 액션 카드로 명확한 선택지를 제공합니다:
//         1. 📖 기존 카드 뉴스 보기 → /story
//         2. 📝 새 프레젠테이션 만들기 → /generate
//
// 🎓 리디자인 포인트:
//   - 기존의 작은 'Create Your Own' 텍스트 버튼을 대형 글래스모피즘 카드로 교체
//   - 두 선택지를 동등한 크기로 배치하여 사용자의 선택을 유도

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ✨ 별 파티클 데이터 (랜덤 위치, 크기, 애니메이션 딜레이)
// 미리 계산해두어 렌더링 시 깜빡임 방지
const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1, // 1px ~ 4px
    duration: `${Math.random() * 3 + 1.5}s`,
    delay: `${Math.random() * 4}s`,
}))

// 🎬 Framer Motion 애니메이션 변수(Variants)
// 페이지 전환 애니메이션: 등장 시 약간 확대→정상 크기, 퇴장 시 축소
const pageVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
}

// 콘텐츠 스태거(Stagger): 자식 요소들이 순서대로 나타나는 효과
const containerVariants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.15 }, // 각 자식이 0.15초 간격으로 등장
    },
}

// 자식 요소 등장 애니메이션 (아래에서 위로 올라오며 투명→불투명)
const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function IntroPage() {
    // useNavigate: 버튼 클릭 등 이벤트로 페이지를 이동할 때 사용하는 훅
    const navigate = useNavigate()

    return (
        // motion.div: Framer Motion이 제어하는 div. variants를 통해 애니메이션 적용
        <motion.div
            className="page-wrapper flex items-center justify-center overflow-hidden"
            // 딥 다크 우주 그라디언트 배경
            style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
        >
            {/* ✨ 별 파티클 레이어 */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        '--duration': star.duration,
                        '--delay': star.delay,
                    } as React.CSSProperties}
                />
            ))}

            {/* 🌟 메인 콘텐츠 영역 */}
            <motion.div
                className="relative z-10 text-center px-6 max-w-2xl w-full"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {/* 아이콘 */}
                <motion.div
                    variants={itemVariants}
                    className="text-6xl mb-4 inline-block animate-float"
                >
                    🦸‍♂️
                </motion.div>

                {/* 메인 타이틀 */}
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight"
                    style={{ textShadow: '0 0 40px rgba(167,139,250,0.8)' }}
                >
                    카드 뉴스 메이커
                </motion.h1>

                {/* 서브 타이틀 */}
                <motion.p
                    variants={itemVariants}
                    className="text-base md:text-lg text-purple-200 mb-8 font-medium"
                >
                    마크다운을 아름다운 카드 뉴스로 변환하세요
                </motion.p>

                {/* ━━━ 두 개의 대형 액션 카드 ━━━ */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto"
                >
                    {/* 📖 기존 카드 보기 — 보라색 그라디언트 카드 */}
                    <motion.button
                        onClick={() => navigate('/story')}
                        whileHover={{
                            scale: 1.04,
                            boxShadow: '0 0 40px rgba(139,92,246,0.6)',
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="
                            flex-1 p-6 rounded-2xl cursor-pointer border border-white/10
                            bg-gradient-to-br from-violet-600/80 to-indigo-700/80
                            backdrop-blur-md
                            text-left
                            transition-all duration-300
                        "
                        style={{ boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}
                    >
                        {/* 카드 아이콘 */}
                        <div className="text-4xl mb-3">📖</div>
                        {/* 카드 타이틀 */}
                        <h3 className="text-xl font-bold text-white mb-1">
                            카드 뉴스 보기
                        </h3>
                        {/* 카드 설명 */}
                        <p className="text-sm text-purple-200/80">
                            저장된 프레젠테이션을 슬라이드로 감상합니다
                        </p>
                        {/* 화살표 힌트 */}
                        <div className="mt-3 text-purple-300 text-sm font-medium">
                            시작하기 →
                        </div>
                    </motion.button>

                    {/* 📝 새 프레젠테이션 만들기 — 에메랄드 그라디언트 카드 */}
                    <motion.button
                        onClick={() => navigate('/generate')}
                        whileHover={{
                            scale: 1.04,
                            boxShadow: '0 0 40px rgba(52,211,153,0.6)',
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="
                            flex-1 p-6 rounded-2xl cursor-pointer border border-white/10
                            bg-gradient-to-br from-emerald-600/80 to-teal-700/80
                            backdrop-blur-md
                            text-left
                            transition-all duration-300
                        "
                        style={{ boxShadow: '0 8px 32px rgba(52,211,153,0.2)' }}
                    >
                        {/* 카드 아이콘 */}
                        <div className="text-4xl mb-3">📝</div>
                        {/* 카드 타이틀 */}
                        <h3 className="text-xl font-bold text-white mb-1">
                            새 프레젠테이션 만들기
                        </h3>
                        {/* 카드 설명 */}
                        <p className="text-sm text-emerald-200/80">
                            마크다운 파일을 업로드하거나 직접 입력하세요
                        </p>
                        {/* 화살표 힌트 */}
                        <div className="mt-3 text-emerald-300 text-sm font-medium">
                            시작하기 →
                        </div>
                    </motion.button>
                </motion.div>

                {/* 브랜드 푸터 */}
                <motion.p
                    variants={itemVariants}
                    className="text-xs text-white/20 mt-8"
                >
                    Kenneth Cruise Guide · 어벤져스 팀
                </motion.p>
            </motion.div>
        </motion.div>
    )
}

