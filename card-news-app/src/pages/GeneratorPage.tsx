// 📦 콘텐츠 생성기 페이지 (Generator Page) — v2 AI 통합
// 담당: 🤖 오토메이션 박사 + 🎨 킴 디자이너 + 📖 스토리텔러 이
// 설명: 두 가지 모드로 카드 뉴스를 생성할 수 있습니다:
//   [🤖 AI 자동 생성] 타이틀만 입력 → Gemini AI가 전략 카드 자동 생성
//   [📝 직접 입력]    마크다운을 직접 입력/업로드하여 카드로 변환
//
// 🎓 핵심 개념:
//   - 탭(Tab) UI: 두 모드를 전환하는 인터페이스 패턴
//   - Gemini API: Google의 AI 모델로 텍스트 생성
//   - 상태 머신(State Machine): 로딩/에러/성공을 체계적으로 관리

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../context/CardContext';
import { type CardData } from '../data/cards';
import {
    generateCardsWithAI,
    getApiKey,
    setApiKey,
    clearApiKey,
} from '../services/geminiService';

// ────────────────────────────────────────────────────
// 📝 Marp 마크다운 파싱 함수 (기존 유지)
// ────────────────────────────────────────────────────
const parseMarkdown = (markdown: string): CardData[] => {
    const slides = markdown.split(/^---$/gm).filter(slide => slide.trim().length > 0);
    if (slides[0]?.includes('marp: true')) {
        slides.shift();
    }

    const newCards: CardData[] = [];
    let idCounter = 1;

    slides.forEach((slide) => {
        const lines = slide.trim().split('\n');
        let title = '';
        let description = '';
        let tag = '생성됨';
        let emoji = '📄';

        const titleLine = lines.find(line => line.startsWith('# '));
        if (titleLine) {
            title = titleLine.replace('# ', '').trim();
        } else {
            const subTitleLine = lines.find(line => line.startsWith('## '));
            if (subTitleLine) title = subTitleLine.replace('## ', '').trim();
        }

        description = lines
            .filter(line => !line.startsWith('#') && !line.startsWith('---') && !line.startsWith('<!--'))
            .join(' ')
            .replace(/\s+/g, ' ')
            .substr(0, 150) + (slide.length > 150 ? '...' : '');

        if (title.includes('요약') || title.includes('결론')) {
            emoji = '💡'; tag = 'Core';
        } else if (title.includes('예시') || title.includes('사례')) {
            emoji = '🔍'; tag = 'Example';
        }

        if (title) {
            newCards.push({
                id: idCounter++, emoji, title,
                description: description || '내용이 없습니다.', tag,
                gradient: 'from-gray-700 via-gray-800 to-gray-900',
            });
        }
    });
    return newCards;
};

// ────────────────────────────────────────────────────
// 🎨 그라디언트 색상 팔레트 (마크다운 모드 전용)
// ────────────────────────────────────────────────────
const MD_GRADIENTS = [
    'from-red-500 via-orange-500 to-yellow-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-blue-500 via-indigo-500 to-purple-500',
    'from-pink-500 via-rose-500 to-red-500',
];

// ────────────────────────────────────────────────────
// 🖥️ GeneratorPage 메인 컴포넌트
// ────────────────────────────────────────────────────
export default function GeneratorPage() {
    const { setCards, resetCards } = useCards();
    const navigate = useNavigate();

    // 🔀 현재 모드: 'ai' = AI 자동 생성, 'manual' = 직접 입력
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');

    // 🤖 AI 모드 상태
    const [aiTitle, setAiTitle] = useState('');           // 사용자가 입력한 주제
    const [isLoading, setIsLoading] = useState(false);    // AI 생성 중 로딩 상태
    const [error, setError] = useState<string | null>(null); // 에러 메시지

    // 🔑 API 키 관리
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const hasApiKey = !!getApiKey();

    // 📝 직접 입력 모드 상태
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 AI 카드 생성 핸들러
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleAIGenerate = async () => {
        if (!aiTitle.trim()) {
            setError('주제를 입력해주세요!');
            return;
        }

        // API 키가 없으면 입력 모달 표시
        if (!getApiKey()) {
            setShowApiKeyInput(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Gemini API 호출 → 카드 데이터 생성
            const cards = await generateCardsWithAI(aiTitle);
            setCards(cards);
            navigate('/story'); // 생성 완료 → 카드 뷰어로 이동
        } catch (err: unknown) {
            // 에러 유형별 사용자 친화적 메시지
            const message = err instanceof Error ? err.message : '알 수 없는 오류';
            if (message === 'API_KEY_MISSING') {
                setShowApiKeyInput(true);
            } else if (message === 'API_KEY_INVALID') {
                setError('❌ API 키가 유효하지 않습니다. 다시 확인해주세요.');
                clearApiKey();
            } else if (message === 'RATE_LIMIT') {
                setError('⏳ 요청 한도 초과! 잠시 후 다시 시도해주세요.');
            } else if (message === 'PARSE_ERROR' || message === 'EMPTY_RESPONSE') {
                setError('⚠️ AI 응답을 처리할 수 없습니다. 다시 시도해주세요.');
            } else {
                setError(`❌ 오류: ${message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 🔑 API 키 저장 핸들러
    const handleSaveApiKey = () => {
        if (apiKeyInput.trim()) {
            setApiKey(apiKeyInput.trim());
            setShowApiKeyInput(false);
            setApiKeyInput('');
            // 키 저장 후 자동으로 AI 생성 시도
            handleAIGenerate();
        }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 마크다운 모드 핸들러들 (기존 유지)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleManualGenerate = () => {
        if (!text.trim()) { alert('내용을 입력해주세요!'); return; }
        const generatedCards = parseMarkdown(text);
        if (generatedCards.length === 0) {
            alert('카드를 생성할 수 없습니다. 마크다운 형식을 확인해주세요.');
            return;
        }
        const styledCards = generatedCards.map((card, idx) => ({
            ...card, gradient: MD_GRADIENTS[idx % MD_GRADIENTS.length],
        }));
        setCards(styledCards);
        alert(`${styledCards.length}장의 카드가 생성되었습니다!`);
        navigate('/story');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setText(content);
        };
        reader.readAsText(file);
    };

    // ────────────────────────────────────────────────────
    // 🖼️ UI 렌더링
    // ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
            {/* 페이지 타이틀 */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-6"
            >
                ✨ 콘텐츠 생성기
            </motion.h1>

            <div className="w-full max-w-2xl">
                {/* ━━━ 탭 네비게이션 ━━━ */}
                <div className="flex mb-6 bg-slate-800 rounded-xl p-1">
                    <button
                        onClick={() => { setMode('ai'); setError(null); }}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer border-0 ${mode === 'ai'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white bg-transparent'
                            }`}
                    >
                        🤖 AI 자동 생성
                    </button>
                    <button
                        onClick={() => { setMode('manual'); setError(null); }}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer border-0 ${mode === 'manual'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white bg-transparent'
                            }`}
                    >
                        📝 직접 입력
                    </button>
                </div>

                {/* ━━━ 탭 콘텐츠 (애니메이션 전환) ━━━ */}
                <AnimatePresence mode="wait">
                    {mode === 'ai' ? (
                        // ━━━━━━━━━━━━━━━━━━━━━━━━
                        // 🤖 AI 자동 생성 모드
                        // ━━━━━━━━━━━━━━━━━━━━━━━━
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* AI 모드 설명 */}
                            <div className="bg-violet-900/30 border border-violet-500/20 rounded-xl p-4">
                                <p className="text-sm text-violet-200">
                                    💡 <strong>주제만 입력하세요!</strong> Gemini AI가 해당 주제에 대한 최고의 실질적 전략을 5~7장의 카드 뉴스로 자동 생성합니다.
                                </p>
                            </div>

                            {/* 주제 입력 필드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    📌 프레젠테이션 주제
                                </label>
                                <input
                                    type="text"
                                    value={aiTitle}
                                    onChange={(e) => { setAiTitle(e.target.value); setError(null); }}
                                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAIGenerate()}
                                    placeholder="예: 스타트업 마케팅 전략, AI 활용 교육 혁신, 건강한 식습관..."
                                    className="w-full px-5 py-4 rounded-xl bg-slate-800 border-2 border-slate-600 
                                        focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 
                                        outline-none text-lg font-medium placeholder:text-slate-500
                                        transition-all duration-300"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            {/* 에러 메시지 */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-sm text-red-300"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* AI 생성 버튼 */}
                            <motion.button
                                onClick={handleAIGenerate}
                                disabled={isLoading || !aiTitle.trim()}
                                whileHover={!isLoading ? { scale: 1.02 } : {}}
                                whileTap={!isLoading ? { scale: 0.98 } : {}}
                                className={`w-full py-4 rounded-xl font-bold text-lg cursor-pointer border-0 transition-all duration-300 ${isLoading
                                        ? 'bg-slate-700 text-slate-400 cursor-wait'
                                        : aiTitle.trim()
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        {/* 로딩 스피너 */}
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        AI가 전략을 분석 중...
                                    </span>
                                ) : (
                                    '🤖 AI로 카드 생성하기'
                                )}
                            </motion.button>

                            {/* API 키 상태 표시 */}
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {hasApiKey ? '🔑 API 키 설정됨' : '🔑 API 키 미설정'}
                                </span>
                                <button
                                    onClick={() => setShowApiKeyInput(true)}
                                    className="text-violet-400 hover:text-violet-300 transition-colors bg-transparent border-0 cursor-pointer"
                                >
                                    {hasApiKey ? 'API 키 변경' : 'API 키 설정'}
                                </button>
                            </div>

                            {/* 예시 주제 추천 */}
                            <div className="pt-2">
                                <p className="text-xs text-slate-500 mb-2">💬 추천 주제:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        '스타트업 성장 전략',
                                        'AI 비즈니스 활용법',
                                        '효과적인 팀 관리',
                                        '디지털 마케팅 핵심',
                                        'MZ세대 소비 트렌드',
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setAiTitle(suggestion)}
                                            className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 
                                                text-xs text-slate-300 hover:border-violet-500 hover:text-violet-300
                                                transition-all cursor-pointer"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // ━━━━━━━━━━━━━━━━━━━━━━━━
                        // 📝 직접 입력 모드
                        // ━━━━━━━━━━━━━━━━━━━━━━━━
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* 파일 업로드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    📁 마크다운(.md) 파일 불러오기
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept=".md,.txt"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-violet-50 file:text-violet-700
                                            hover:file:bg-violet-100"
                                    />
                                    <button
                                        onClick={resetCards}
                                        className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border-0"
                                    >
                                        초기화
                                    </button>
                                </div>
                            </div>

                            {/* 텍스트 에리어 */}
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-72 p-4 rounded-xl bg-slate-800 border border-slate-700 
                                    focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 
                                    outline-none font-mono text-sm leading-relaxed"
                                placeholder={`# 슬라이드 제목\n\n내용을 여기에 입력하세요.\n\n---\n\n# 두 번째 슬라이드\n\n...`}
                            />

                            {/* 생성 버튼 */}
                            <button
                                onClick={handleManualGenerate}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 
                                    hover:opacity-90 transition-opacity font-bold shadow-lg shadow-emerald-500/30
                                    cursor-pointer border-0"
                            >
                                📝 마크다운으로 카드 생성
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ━━━ 하단 네비게이션 ━━━ */}
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold cursor-pointer border-0"
                    >
                        ← 홈으로
                    </button>
                    <button
                        onClick={() => navigate('/story')}
                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold cursor-pointer border-0"
                    >
                        📖 카드 보기
                    </button>
                </div>
            </div>

            {/* ━━━ API 키 입력 모달 ━━━ */}
            <AnimatePresence>
                {showApiKeyInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowApiKeyInput(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-600 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-2">🔑 Gemini API 키 설정</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Google AI Studio에서 발급받은 API 키를 입력하세요.
                                <br />
                                키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                            </p>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-violet-400 hover:text-violet-300 mb-4 inline-block"
                            >
                                → API 키 발급받기 (Google AI Studio)
                            </a>
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-500 
                                    focus:border-violet-500 outline-none text-sm mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowApiKeyInput(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-500 
                                        font-bold transition-colors cursor-pointer border-0"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveApiKey}
                                    disabled={!apiKeyInput.trim()}
                                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 
                                        font-bold transition-colors cursor-pointer border-0
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    저장 & 생성
                                </button>
                            </div>
                            {hasApiKey && (
                                <button
                                    onClick={() => { clearApiKey(); setShowApiKeyInput(false); }}
                                    className="w-full mt-3 text-xs text-red-400 hover:text-red-300 
                                        transition-colors bg-transparent border-0 cursor-pointer"
                                >
                                    기존 API 키 삭제
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
