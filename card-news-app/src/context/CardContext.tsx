// 📦 카드 전역 상태 관리 (React Context API)
// 담당: 🤖 오토메이션 박사 (상태 관리 전문)
// 설명: 이 파일은 React의 Context API를 사용하여 카드 데이터를 앱 전체에서 공유합니다.
//
// 🎓 핵심 개념 — Context API란?
//   React에서 부모 → 자식으로 데이터를 전달할 때 보통 props를 사용합니다.
//   하지만 깊이 중첩된 컴포넌트에 데이터를 전달하려면 중간 컴포넌트들이
//   모두 props를 받아서 내려줘야 합니다 (이를 "Props Drilling"이라 합니다).
//   Context API는 이 문제를 해결합니다:
//     1. createContext()로 "데이터 저장소(Context)"를 만듭니다.
//     2. Provider 컴포넌트로 데이터를 "공급"합니다.
//     3. useContext() 훅으로 어디서든 데이터를 "소비"합니다.
//
// 💾 추가 기능: localStorage를 활용한 데이터 영속화
//   브라우저를 닫았다가 다시 열어도 마지막 카드 상태가 유지됩니다.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { cards as initialCards, type CardData } from '../data/cards';

// ────────────────────────────────────────────────────
// 1단계: Context에 들어갈 데이터의 "타입(모양)"을 정의합니다.
// ────────────────────────────────────────────────────
// TypeScript의 interface: 객체가 반드시 가져야 할 속성과 그 타입을 명시
// 이렇게 하면 코드 작성 시 자동 완성과 오류 검출이 가능해집니다.
interface CardContextType {
    cards: CardData[];              // 현재 표시 중인 카드 배열
    setCards: (cards: CardData[]) => void;  // 카드 배열을 교체하는 함수
    resetCards: () => void;         // 카드를 기본값(초기 데이터)으로 되돌리는 함수
}

// ────────────────────────────────────────────────────
// 2단계: Context 객체를 생성합니다.
// ────────────────────────────────────────────────────
// createContext의 초기값을 undefined로 설정 → Provider 없이 사용 시 에러를 감지하기 위함
const CardContext = createContext<CardContextType | undefined>(undefined);

// ────────────────────────────────────────────────────
// 3단계: Provider 컴포넌트 — 데이터를 "공급"하는 역할
// ────────────────────────────────────────────────────
// children: 이 Provider 안에 감싸진 모든 자식 컴포넌트를 의미합니다.
//   예) <CardProvider><App /></CardProvider> → App이 children
export const CardProvider = ({ children }: { children: ReactNode }) => {

    // 🔧 useState의 "지연 초기화(Lazy Initialization)" 패턴
    //   useState에 함수를 전달하면 초기 렌더링 한 번만 실행됩니다.
    //   localStorage 읽기는 비용이 크므로, 매 렌더링마다 하지 않고 처음 한 번만 수행합니다.
    const [cards, setCardsState] = useState<CardData[]>(() => {
        const savedCards = localStorage.getItem('app-cards');
        // 저장된 데이터가 있으면 파싱하여 사용, 없으면 기본 데이터(initialCards) 사용
        return savedCards ? JSON.parse(savedCards) : initialCards;
    });

    // 🔄 useEffect: 카드가 변경될 때마다 localStorage에 자동 저장
    //   의존성 배열 [cards] → cards 값이 바뀔 때만 실행됩니다.
    useEffect(() => {
        localStorage.setItem('app-cards', JSON.stringify(cards));
    }, [cards]);

    // ✏️ 외부에서 카드 배열을 교체할 때 호출하는 함수
    //   예: GeneratorPage에서 새 카드를 생성한 후 setCards(newCards) 호출
    const setCards = (newCards: CardData[]) => {
        setCardsState(newCards);
    };

    // 🔄 초기화 함수: 카드를 원래 기본 데이터로 되돌립니다
    //   localStorage도 함께 비워서 다음 방문 시에도 기본값을 사용하게 합니다.
    const resetCards = () => {
        setCardsState(initialCards);
        localStorage.removeItem('app-cards');
    };

    // Provider의 value 속성에 공유할 데이터와 함수를 전달합니다.
    // 이 Provider로 감싸진 모든 자식 컴포넌트에서 이 값들을 사용할 수 있습니다.
    return (
        <CardContext.Provider value={{ cards, setCards, resetCards }}>
            {children}
        </CardContext.Provider>
    );
};

// ────────────────────────────────────────────────────
// 4단계: 커스텀 Hook — Context를 편리하게 가져다 쓰는 도우미
// ────────────────────────────────────────────────────
// 🎓 왜 커스텀 Hook을 만들까?
//   매번 useContext(CardContext)를 쓰는 대신, useCards() 한 줄로 간편하게 사용 가능!
//   또한 Provider 바깥에서 실수로 사용한 경우 명확한 에러 메시지를 보여줍니다.
export const useCards = () => {
    const context = useContext(CardContext);
    if (!context) {
        // Provider 바깥에서 호출하면 이 에러가 발생합니다.
        // 디버깅 시 "CardProvider로 감싸야 한다"는 힌트를 제공합니다.
        throw new Error('useCards must be used within a CardProvider');
    }
    return context;
};
