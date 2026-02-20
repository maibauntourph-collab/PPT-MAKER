// 📦 랜딩 페이지 (Intro Page)
// 담당: 🎨 킴 디자이너
// 설명: 사용자가 처음 만나는 화면입니다. 아름다운 배경과 함께 타이틀이 나타나고,
//       [시작하기] 버튼을 누르면 /story 페이지로 부드럽게 이동합니다.

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
// 페이지 전환 애니메이션: 아래에서 올라오며 등장, 위로 사라지며 퇴장
const pageVariants = {
    initial: { opacity: 0, scale: 1.05 },     // 처음 상태: 불투명하고 약간 큰 상태
    animate: { opacity: 1, scale: 1 },          // 등장 상태: 완전히 보이고 정상 크기
    exit: { opacity: 0, scale: 0.95 },        // 퇴장 상태: 사라지며 약간 작아짐
}

// 콘텐츠 스태거(Stagger): 자식 요소들이 순서대로 나타나는 효과
const containerVariants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.2 }, // 각 자식이 0.2초 간격으로 등장
    },
}

// 자식 요소 등장 애니메이션
const itemVariants = {
    initial: { opacity: 0, y: 30 },  // 아래에서 등장
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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
                className="relative z-10 text-center px-6 max-w-2xl"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {/* 아이콘 */}
                <motion.div
                    variants={itemVariants}
                    className="text-7xl mb-6 inline-block animate-float"
                >
                    🦸‍♂️
                </motion.div>

                {/* 메인 타이틀 */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
                    style={{ textShadow: '0 0 40px rgba(167,139,250,0.8)' }}
                >
                    어벤져스 팀
                </motion.h1>

                {/* 서브 타이틀 */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-purple-200 mb-4 font-medium"
                >
                    Kenneth Cruise Guide
                </motion.p>

                <motion.p
                    variants={itemVariants}
                    className="text-base text-purple-300 mb-10 opacity-80"
                >
                    핵심 운영·개발 전문가 연합 — 14명의 AI 팀이 여기 있습니다.
                </motion.p>

                {/* [시작하기] 버튼 */}
                <motion.button
                    variants={itemVariants}
                    onClick={() => navigate('/story')}
                    // 호버 및 클릭 인터랙션 (Framer Motion의 gesture 기능)
                    whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(167,139,250,0.9)' }}
                    whileTap={{ scale: 0.95 }}
                    className="
            px-10 py-4 rounded-full text-white font-bold text-lg
            bg-gradient-to-r from-violet-600 to-indigo-600
            shadow-lg shadow-violet-500/50
            transition-shadow duration-300
            cursor-pointer border-0
            mb-8
          "
                    style={{ boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
                >
                    시작하기 →
                </motion.button>

                {/* 생성기 링크 */}
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => navigate('/generate')}
                        className="text-xs text-white/30 hover:text-white/80 transition-colors uppercase tracking-widest bg-transparent border-0 cursor-pointer"
                    >
                        🛠️ Create Your Own
                    </button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
