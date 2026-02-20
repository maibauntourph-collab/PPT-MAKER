import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../context/CardContext';
import { CardData } from '../data/cards';

// Marp Markdown 파싱 함수
const parseMarkdown = (markdown: string): CardData[] => {
    // --- 로 슬라이드 분리 (Frontmatter 제거)
    const slides = markdown.split(/^---$/gm).filter(slide => slide.trim().length > 0);

    // 첫 번째 슬라이드가 Frontmatter일 경우 제외
    if (slides[0].includes('marp: true')) {
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

        // 제목 추출 (# Title)
        const titleLine = lines.find(line => line.startsWith('# '));
        if (titleLine) {
            title = titleLine.replace('# ', '').trim();
        } else {
            // # 없으면 ## 찾기
            const subTitleLine = lines.find(line => line.startsWith('## '));
            if (subTitleLine) title = subTitleLine.replace('## ', '').trim();
        }

        // 본문 추출 (제목 제외한 나머지)
        description = lines
            .filter(line => !line.startsWith('#') && !line.startsWith('---') && !line.startsWith('<!--'))
            .join(' ')
            .replace(/\s+/g, ' ') // 공백 정리
            .substr(0, 150) + (slide.length > 150 ? '...' : ''); // 길이 제한

        // 간단한 이모지/태그 추론 (예시)
        if (title.includes('요약') || title.includes('결론')) {
            emoji = '💡';
            tag = 'Core';
        } else if (title.includes('예시') || title.includes('사례')) {
            emoji = '🔍';
            tag = 'Example';
        }

        if (title) {
            newCards.push({
                id: idCounter++,
                emoji,
                title,
                description: description || '내용이 없습니다.',
                tag,
                gradient: 'from-gray-700 via-gray-800 to-gray-900', // 기본 그라디언트
            });
        }
    });

    return newCards;
};

export default function GeneratorPage() {
    const { setCards, resetCards } = useCards();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        // 색상 랜덤 할당 (UX 향상)
        const gradients = [
            'from-red-500 via-orange-500 to-yellow-500',
            'from-green-500 via-emerald-500 to-teal-500',
            'from-blue-500 via-indigo-500 to-purple-500',
            'from-pink-500 via-rose-500 to-red-500'
        ];

        const styledCards = generatedCards.map((card, idx) => ({
            ...card,
            gradient: gradients[idx % gradients.length]
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

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">✨ 콘텐츠 생성기</h1>

            <div className="w-full max-w-2xl space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                    마크다운(.md) 또는 텍스트 파일 불러오기
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
                        className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                        초기화
                    </button>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-96 p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none font-mono text-sm leading-relaxed"
                    placeholder={`# 슬라이드 제목\n\n내용을 여기에 입력하세요.\n\n---\n\n# 두 번째 슬라이드\n\n...`}
                />

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold"
                    >
                        취소
                    </button>
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
