// 📦 카드 뉴스 페이지 (Story Page)
// 담당: 🎨 킴 디자이너 + 🚢 나비게이터 킴 + 🤖 오토메이션 박사
// 설명: 카드 데이터를 순서대로 보여주는 핵심 페이지입니다.
//       - 키보드 방향키 이동 지원
//       - 마지막 페이지 축하 효과 (Confetti)
//       - TTS 음성 듣기 기능 추가

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useKey } from 'react-use'
import { useCards } from '../context/CardContext' // Context Hook 사용

// 🎬 페이지 자체(StoryPage 전체)의 등장/퇴장 애니메이션
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
}

// 🎬 카드 슬라이드 전환 애니메이션
// direction: 1이면 앞으로(다음 카드), -1이면 뒤로(이전 카드)
const cardVariants = {
    // 등장 전 위치: direction에 따라 오른쪽(+) 또는 왼쪽(-)에서 시작
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
    }),
    // 화면 중앙에 위치
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }, // easeOutQuart
    },
    // 퇴장 위치: direction에 따라 왼쪽(-) 또는 오른쪽(+)으로 사라짐
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.35, ease: [0.55, 0.06, 0.68, 0.19] }, // easeInQuart
    }),
}

export default function StoryPage() {
    const { cards } = useCards(); // 전역 상태에서 카드 데이터 가져오기
    // currentIndex: 현재 보이고 있는 카드의 순서 번호 (0부터 시작)
    const [currentIndex, setCurrentIndex] = useState(0)
    // direction: 카드가 어느 방향으로 전환될지 결정 (1: 앞으로, -1: 뒤로)
    const [direction, setDirection] = useState(1)
    // ttsPlaying: 현재 TTS 재생 중 여부
    const [ttsPlaying, setTtsPlaying] = useState(false)

    const navigate = useNavigate()

    const currentCard = cards[currentIndex]
    const isFirst = currentIndex === 0
    const isLast = currentIndex === cards.length - 1
    const progress = ((currentIndex + 1) / cards.length) * 100 // 진행률 % 계산

    // 🔊 TTS 기능: 현재 카드의 내용을 읽어줌
    const speakCurrentCard = useCallback(() => {
        if (!window.speechSynthesis) return

        // 이미 말하고 있다면 취소
        window.speechSynthesis.cancel()

        if (ttsPlaying) {
            setTtsPlaying(false)
            return
        }

        const textToSpeak = `${currentCard.title}. ${currentCard.description}`
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.lang = 'ko-KR'
        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => setTtsPlaying(true)
        utterance.onend = () => setTtsPlaying(false)
        utterance.onerror = () => setTtsPlaying(false)

        window.speechSynthesis.speak(utterance)
    }, [currentCard, ttsPlaying])

    // 카드 변경 시 TTS 중단
    useEffect(() => {
        window.speechSynthesis.cancel()
        setTtsPlaying(false)
    }, [currentIndex])

    // 🎉 마지막 페이지 도달 시 축하 효과 (Confetti)
    useEffect(() => {
        if (isLast) {
            const duration = 3000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a78bfa', '#818cf8', '#ffffff']
                })
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a78bfa', '#818cf8', '#ffffff']
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }
            frame()
        }
    }, [isLast])

    // 다음 카드로 이동하는 함수
    const handleNext = useCallback(() => {
        if (!isLast) {
            setDirection(1)
            setCurrentIndex(prev => prev + 1)
        }
    }, [isLast])

    // 이전 카드로 이동하는 함수
    const handlePrev = useCallback(() => {
        if (!isFirst) {
            setDirection(-1)
            setCurrentIndex(prev => prev - 1)
        }
    }, [isFirst])

    // 처음으로 돌아가는 함수
    const handleRestart = () => {
        setDirection(-1)
        setCurrentIndex(0)
    }

    // 🎹 키보드 네비게이션
    useKey('ArrowRight', handleNext, {}, [handleNext])
    useKey('ArrowLeft', handlePrev, {}, [handlePrev])
    useKey(' ', handleNext, {}, [handleNext]) // 스페이스바도 다음

    // 공유하기 함수 (Web Share API 사용 - 모바일 지원)
    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: '어벤져스 팀 소개',
                text: 'Kenneth Cruise Guide의 어벤져스 팀을 소개합니다!',
                url: window.location.href,
            })
        } else {
            // 데스크탑 등 Web Share API 미지원 환경: 클립보드에 복사
            await navigator.clipboard.writeText(window.location.href)
            alert('링크가 클립보드에 복사되었습니다! 🔗')
        }
    }

    return (
        <motion.div
            className="page-wrapper flex flex-col"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* ━━━ 상단 헤더: 진행 상태 표시 ━━━ */}
            <div className="relative z-10 px-6 pt-6 pb-2">
                {/* 상단 정보: "어벤져스 팀" 제목 + "N / Total" 카운터 */}
                <div className="flex items-center justify-between mb-3 max-w-lg mx-auto">
                    <motion.button
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-purple-300 hover:text-white text-sm font-medium transition-colors cursor-pointer bg-transparent border-0"
                    >
                        ← 처음으로
                    </motion.button>

                    <div className="flex gap-4 items-center">
                        {/* TTS 버튼 */}
                        <motion.button
                            onClick={speakCurrentCard}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors ${ttsPlaying ? 'text-green-400 animate-pulse' : 'text-purple-300 hover:text-white'}`}
                            title="음성으로 듣기"
                        >
                            {ttsPlaying ? '🔊 듣는 중...' : '🔈 듣기'}
                        </motion.button>

                        <span className="text-purple-200 text-sm font-semibold">
                            {currentIndex + 1} / {cards.length}
                        </span>
                    </div>
                </div>

                {/* Progress Bar: 진행률 시각화 */}
                <div className="max-w-lg mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                        // animate로 너비(width)가 부드럽게 변화
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ━━━ 메인 카드 영역 ━━━ */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                {/* AnimatePresence: 카드가 바뀔 때(unmount/mount) 애니메이션 실행
            mode="wait": 기존 카드 퇴장 완료 후 새 카드 등장
            custom: direction 값을 variants에 전달 */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentCard.id} // key가 바뀌면 AnimatePresence가 새 카드로 인식
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        // 💡 카드 클릭으로도 다음으로 이동 (마지막 카드는 제외)
                        onClick={!isLast ? handleNext : undefined}
                        className={`
              w-full max-w-sm md:max-w-md
              rounded-3xl p-8 md:p-10
              bg-gradient-to-br ${currentCard.gradient}
              shadow-2xl
              ${!isLast ? 'cursor-pointer select-none' : ''}
              relative
            `}
                        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                        // 카드 위에서 살짝 떠있는 호버 효과
                        whileHover={!isLast ? { y: -4, transition: { duration: 0.2 } } : {}}
                    >
                        {/* 태그 배지 */}
                        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                            {currentCard.tag}
                        </span>

                        {/* 이모지 */}
                        <div className="text-6xl mb-5">{currentCard.emoji}</div>

                        {/* 카드 타이틀 */}
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                            {currentCard.title}
                        </h2>

                        {/* 카드 설명 */}
                        <p className="text-white/85 text-base leading-relaxed">
                            {currentCard.description}
                        </p>

                        {/* 다음으로 이동 힌트 (마지막 카드가 아닐 때) */}
                        {!isLast && (
                            <div className="mt-8 flex items-center justify-between text-white/60 text-sm font-medium">
                                <div>
                                    <span>탭하여 다음으로</span>
                                    <span className="ml-2">→</span>
                                </div>
                                {/* 키보드 힌트 (데스크탑에서만 보이게 할 수도 있음) */}
                                <div className="hidden md:block opacity-60 text-xs">
                                    (키보드 ◀ ▶ 이동 가능)
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ━━━ 하단: 마지막 카드 액션 버튼 ━━━ */}
            <div className="relative z-10 px-6 pb-8">
                <AnimatePresence>
                    {isLast ? (
                        // 마지막 카드에서만 등장하는 버튼들
                        <motion.div
                            key="actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3 } }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex gap-3 max-w-sm md:max-w-md mx-auto"
                        >
                            {/* 🔄 다시 보기 버튼 */}
                            <motion.button
                                onClick={handleRestart}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex-1 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm text-white font-bold text-sm border border-white/20 cursor-pointer"
                            >
                                🔄 다시 보기
                            </motion.button>

                            {/* 🔗 공유하기 버튼 */}
                            <motion.button
                                onClick={handleShare}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm cursor-pointer border-0 shadow-lg shadow-violet-500/30"
                            >
                                🔗 공유하기
                            </motion.button>
                        </motion.div>
                    ) : (
                        // 일반 카드에서는 다음 버튼 표시
                        <motion.div
                            key="next-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between max-w-sm md:max-w-md mx-auto w-full"
                        >
                            {/* 이전 버튼 (첫 페이지가 아닐 때만) */}
                            <motion.button
                                onClick={handlePrev}
                                disabled={isFirst}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isFirst ? 0 : 1 }}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-3.5 rounded-full text-white font-medium cursor-pointer border-0 transition-opacity ${isFirst ? 'pointer-events-none' : 'bg-transparent'}`}
                            >
                                ← 이전
                            </motion.button>

                            {/* 다음 버튼 */}
                            <motion.button
                                onClick={handleNext}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139,92,246,0.6)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold cursor-pointer border-0 shadow-lg"
                            >
                                다음 →
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
