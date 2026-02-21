// 📦 콘텐츠 생성기 페이지 (Generator Page)
// 담당: 🤖 오토메이션 박사 + 🎨 킴 디자이너
// 설명: 사용자가 마크다운(.md) 파일을 업로드하거나 직접 입력하면,
//       Marp 형식의 슬라이드를 파싱하여 카드 뉴스로 자동 변환합니다.
//
// 🎓 핵심 개념:
//   - Marp: 마크다운을 프레젠테이션으로 변환하는 도구이며, '---'로 슬라이드를 구분합니다.
//   - FileReader API: 브라우저에서 사용자의 로컬 파일을 읽을 수 있는 웹 표준 API입니다.
//   - useRef: React에서 DOM 요소를 직접 참조할 때 사용하는 훅입니다.

import { useState, useRef } from 'react';
// motion은 현재 이 페이지에서 직접 사용하지 않지만, 향후 애니메이션 추가 시 활용 가능
import { useNavigate } from 'react-router-dom';
import { useCards } from '../context/CardContext';
import { type CardData } from '../data/cards';

// ────────────────────────────────────────────────────
// 📝 Marp 마크다운 파싱 함수
// ────────────────────────────────────────────────────
// 입력: Marp 형식의 마크다운 문자열
// 출력: CardData[] (카드 뉴스 데이터 배열)
//
// 🎓 파싱(Parsing)이란?
//   텍스트를 분석하여 구조화된 데이터로 변환하는 과정입니다.
//   예) "# 제목\n내용" → { title: "제목", description: "내용" }
const parseMarkdown = (markdown: string): CardData[] => {
    // 1단계: '---' 구분자로 슬라이드를 분리합니다.
    //   정규식 /^---$/gm: 줄의 처음(^)부터 끝($)까지 '---'만 있는 줄을 찾습니다.
    //   g: 전체에서 검색, m: 각 줄의 시작/끝을 인식
    const slides = markdown.split(/^---$/gm).filter(slide => slide.trim().length > 0);

    // 2단계: 첫 번째 슬라이드가 Frontmatter(설정 영역)이면 제외합니다.
    //   Marp의 Frontmatter 예시: "marp: true\ntheme: default"
    if (slides[0].includes('marp: true')) {
        slides.shift(); // 배열의 첫 번째 요소를 제거
    }

    const newCards: CardData[] = [];
    let idCounter = 1; // 각 카드에 고유 ID 부여

    // 3단계: 각 슬라이드를 순회하며 제목과 본문을 추출합니다.
    slides.forEach((slide) => {
        const lines = slide.trim().split('\n'); // 슬라이드를 줄 단위로 분리
        let title = '';
        let description = '';
        let tag = '생성됨';  // 기본 태그
        let emoji = '📄';    // 기본 이모지

        // 🔍 제목 추출: '#'으로 시작하는 줄을 찾습니다.
        //   '# 제목' → h1 레벨 (우선 검색)
        const titleLine = lines.find(line => line.startsWith('# '));
        if (titleLine) {
            title = titleLine.replace('# ', '').trim();
        } else {
            // h1이 없으면 h2('## 제목')을 찾습니다.
            const subTitleLine = lines.find(line => line.startsWith('## '));
            if (subTitleLine) title = subTitleLine.replace('## ', '').trim();
        }

        // 📄 본문 추출: 제목(#), 구분선(---), HTML 주석(<!--)을 제외한 나머지 텍스트
        description = lines
            .filter(line => !line.startsWith('#') && !line.startsWith('---') && !line.startsWith('<!--'))
            .join(' ')
            .replace(/\s+/g, ' ') // 연속된 공백을 하나로 정리
            .substr(0, 150) + (slide.length > 150 ? '...' : ''); // 150자 제한 + 말줄임표

        // 🏷️ 간단한 이모지/태그 자동 추론
        //   제목에 특정 키워드가 포함되면 맞는 이모지와 태그를 부여합니다.
        if (title.includes('요약') || title.includes('결론')) {
            emoji = '💡';
            tag = 'Core';
        } else if (title.includes('예시') || title.includes('사례')) {
            emoji = '🔍';
            tag = 'Example';
        }

        // 제목이 있는 슬라이드만 카드로 추가
        if (title) {
            newCards.push({
                id: idCounter++,
                emoji,
                title,
                description: description || '내용이 없습니다.',
                tag, // 자동 추론된 태그 (예: 'Core', 'Example', '생성됨')
                gradient: 'from-gray-700 via-gray-800 to-gray-900', // 기본 그라디언트 (나중에 교체됨)
            });
        }
    });

    return newCards;
};

// ────────────────────────────────────────────────────
// 🖥️ GeneratorPage 컴포넌트
// ────────────────────────────────────────────────────
export default function GeneratorPage() {
    // Context에서 카드 상태 업데이트/초기화 함수를 가져옵니다.
    const { setCards, resetCards } = useCards();
    const navigate = useNavigate();

    // text: 텍스트 에리어에 입력된 마크다운 원본 텍스트
    const [text, setText] = useState('');
    // fileInputRef: 파일 입력 DOM 요소를 직접 참조하기 위한 ref
    //   🎓 useRef는 렌더링과 무관하게 값을 유지하며, .current로 DOM에 접근합니다.
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🪄 카드 생성 핸들러: 입력된 마크다운을 파싱하여 카드로 변환합니다.
    const handleGenerate = () => {
        if (!text.trim()) {
            alert('내용을 입력해주세요!');
            return;
        }
        const generatedCards = parseMarkdown(text);
        if (generatedCards.length === 0) {
            alert('카드를 생성할 수 없습니다. 마크다운 형식을 확인해주세요.');
            return;
        }

        // 🎨 그라디언트 색상을 순환(Cycle) 방식으로 랜덤 할당하여 시각적 다양성 부여
        const gradients = [
            'from-red-500 via-orange-500 to-yellow-500',
            'from-green-500 via-emerald-500 to-teal-500',
            'from-blue-500 via-indigo-500 to-purple-500',
            'from-pink-500 via-rose-500 to-red-500'
        ];

        // 각 카드에 그라디언트를 순환 할당 (idx % gradients.length로 반복)
        const styledCards = generatedCards.map((card, idx) => ({
            ...card, // 기존 카드 데이터를 스프레드(복사)
            gradient: gradients[idx % gradients.length] // 색상 덮어쓰기
        }));

        // Context에 새 카드 저장 → StoryPage에서 바로 확인 가능
        setCards(styledCards);
        alert(`${styledCards.length}장의 카드가 생성되었습니다!`);
        navigate('/story'); // 카드 뷰어 페이지로 이동
    };

    // 📁 파일 업로드 핸들러: .md 또는 .txt 파일을 읽어서 텍스트 에리어에 표시합니다.
    //   🎓 FileReader API 기본 흐름:
    //     1. new FileReader() 생성
    //     2. reader.onload에 콜백 등록 (파일 읽기 완료 시 실행)
    //     3. reader.readAsText(file)로 읽기 시작 (비동기)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // 선택된 첫 번째 파일
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string; // 읽어들인 문자열
            setText(content); // 텍스트 에리어에 반영
        };
        reader.readAsText(file); // UTF-8 텍스트로 읽기
    };

    // ────────────────────────────────────────────────────
    // 🖼️ UI 렌더링
    // ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
            {/* 페이지 타이틀 */}
            <h1 className="text-3xl font-bold mb-6">✨ 콘텐츠 생성기</h1>

            <div className="w-full max-w-2xl space-y-4">
                {/* 파일 업로드 영역 */}
                <label className="block text-sm font-medium text-gray-300">
                    마크다운(.md) 또는 텍스트 파일 불러오기
                </label>
                <div className="flex gap-2">
                    {/* 파일 선택 input: accept 속성으로 .md, .txt만 허용 */}
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
                    {/* 초기화 버튼: 카드 데이터를 기본 데이터로 복구 */}
                    <button
                        onClick={resetCards}
                        className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                        초기화
                    </button>
                </div>

                {/* 마크다운 직접 입력 영역 (textarea) */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-96 p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none font-mono text-sm leading-relaxed"
                    placeholder={`# 슬라이드 제목\n\n내용을 여기에 입력하세요.\n\n---\n\n# 두 번째 슬라이드\n\n...`}
                />

                {/* 하단 액션 버튼 영역 */}
                <div className="flex gap-4">
                    {/* 취소 버튼: 인트로 페이지로 돌아감 */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold"
                    >
                        취소
                    </button>
                    {/* 생성 버튼: 입력된 마크다운을 파싱하여 카드로 변환 */}
                    <button
                        onClick={handleGenerate}
                        className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity font-bold shadow-lg shadow-violet-500/30"
                    >
                        🪄 카드 생성하기
                    </button>
                </div>
            </div>
        </div>
    );
}
