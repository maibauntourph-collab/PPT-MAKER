// 📦 Gemini AI 서비스 모듈
// 담당: 🤖 오토메이션 박사 (AI 연동 전문)
// 설명: Google Gemini API를 호출하여 주제(타이틀)를 기반으로
//       전략적 카드 뉴스 콘텐츠를 자동 생성합니다.
//
// 🎓 핵심 개념:
//   - Gemini API: Google의 대규모 언어 모델(LLM) API
//   - 프롬프트 엔지니어링: AI에게 원하는 결과를 얻기 위한 지시문 설계
//   - localStorage: 브라우저에 API 키를 안전하게 저장 (서버 전송 없음)

import { type CardData } from '../data/cards';

// ────────────────────────────────────────────────────
// 🔑 API 키 관리 함수
// ────────────────────────────────────────────────────
const API_KEY_STORAGE = 'gemini-api-key';

// localStorage에서 저장된 API 키를 가져옵니다.
export const getApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE);
};

// API 키를 localStorage에 저장합니다.
export const setApiKey = (key: string): void => {
    localStorage.setItem(API_KEY_STORAGE, key);
};

// 저장된 API 키를 삭제합니다.
export const clearApiKey = (): void => {
    localStorage.removeItem(API_KEY_STORAGE);
};

// ────────────────────────────────────────────────────
// 🎯 AI 카드 생성 프롬프트 (프롬프트 엔지니어링)
// ────────────────────────────────────────────────────
// 🎓 프롬프트 엔지니어링이란?
//   AI에게 "이런 형식으로 이런 내용을 만들어줘"라고 구체적으로 지시하는 기술입니다.
//   아래 프롬프트는 JSON 형식으로 카드 데이터를 반환하도록 설계되었습니다.
const buildPrompt = (title: string): string => {
    return `당신은 최고의 전략 컨설턴트이자 프레젠테이션 전문가입니다.
다음 주제에 대해 **최고의 실질적인 전략**을 5~7장의 카드 뉴스로 만들어주세요.

📌 주제: "${title}"

## 요구사항:
1. 각 카드는 핵심 전략 하나에 집중할 것
2. 실제 적용 가능한 구체적 전략 & 액션 아이템 포함
3. 데이터/통계/사례가 있으면 포함
4. 마지막 카드는 핵심 요약 또는 실행 체크리스트
5. 한국어로 작성

## 반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
[
  {
    "emoji": "적절한 이모지 1개",
    "title": "카드 제목 (15자 이내)",
    "description": "카드 본문 내용 (80~120자, 구체적이고 실용적인 전략)",
    "tag": "카테고리 태그 (예: 핵심전략, 실행방안, 데이터, 사례, 요약)"
  }
]`;
};

// ────────────────────────────────────────────────────
// 🤖 Gemini API 호출 함수
// ────────────────────────────────────────────────────
// 🎓 fetch API란?
//   브라우저에서 HTTP 요청을 보내는 표준 API입니다.
//   async/await: 비동기 작업을 동기적으로 작성할 수 있게 해주는 문법
//
// 입력: title (사용자가 입력한 주제)
// 출력: CardData[] (생성된 카드 데이터 배열)
// 예외: API 키 없음, 네트워크 오류, 파싱 오류 시 에러 throw

// 사용 가능한 그라디언트 색상 팔레트 (카드에 순환 배정)
const GRADIENTS = [
    'from-violet-600 via-purple-600 to-indigo-600',
    'from-emerald-500 via-green-600 to-teal-600',
    'from-orange-500 via-red-500 to-pink-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-amber-500 via-yellow-600 to-orange-500',
    'from-rose-500 via-pink-500 to-fuchsia-500',
    'from-sky-500 via-blue-600 to-indigo-600',
];

export const generateCardsWithAI = async (title: string): Promise<CardData[]> => {
    // 1단계: API 키 확인
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API_KEY_MISSING');
    }

    // 2단계: Gemini API 엔드포인트 구성
    //   모델: gemini-2.0-flash (빠르고 효율적인 모델)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 3단계: API 요청 본문 구성
    const requestBody = {
        contents: [{
            parts: [{
                text: buildPrompt(title),
            }],
        }],
        // 생성 설정: temperature 0.8로 창의성과 정확성의 균형
        generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    };

    // 4단계: fetch로 API 호출 (비동기)
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    // 5단계: HTTP 에러 처리
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 400 || response.status === 403) {
            throw new Error('API_KEY_INVALID');
        }
        if (response.status === 429) {
            throw new Error('RATE_LIMIT');
        }
        throw new Error(`API_ERROR: ${errorData?.error?.message || response.statusText}`);
    }

    // 6단계: 응답 파싱
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error('EMPTY_RESPONSE');
    }

    // 7단계: JSON 추출 (AI 응답에서 JSON 배열만 추출)
    //   AI가 ```json ... ``` 형태로 감쌀 수 있으므로, 정규식으로 순수 JSON만 추출
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('PARSE_ERROR');
    }

    // 8단계: JSON 파싱 → CardData[] 변환
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
        emoji: string;
        title: string;
        description: string;
        tag: string;
    }>;

    // 9단계: 그라디언트 색상 배정 및 ID 부여
    const cards: CardData[] = parsed.map((item, idx) => ({
        id: idx + 1,
        emoji: item.emoji || '📌',
        title: item.title,
        description: item.description,
        tag: item.tag || '전략',
        gradient: GRADIENTS[idx % GRADIENTS.length],
    }));

    return cards;
};
