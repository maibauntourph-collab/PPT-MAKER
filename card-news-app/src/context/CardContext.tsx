import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cards as initialCards, CardData } from '../data/cards';

// Context 타입 정의
interface CardContextType {
    cards: CardData[];
    setCards: (cards: CardData[]) => void;
    resetCards: () => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

// Provider 컴포넌트
export const CardProvider = ({ children }: { children: ReactNode }) => {
    // 초기 상태는 로컬 스토리지에서 가져오거나 기본 데이터 사용
    const [cards, setCardsState] = useState<CardData[]>(() => {
        const savedCards = localStorage.getItem('app-cards');
        return savedCards ? JSON.parse(savedCards) : initialCards;
    });

    // 카드가 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem('app-cards', JSON.stringify(cards));
    }, [cards]);

    // 외부에서 setCards 호출 시 상태 업데이트
    const setCards = (newCards: CardData[]) => {
        setCardsState(newCards);
    };

    // 초기화 함수
    const resetCards = () => {
        setCardsState(initialCards);
        localStorage.removeItem('app-cards');
    };

    return (
        <CardContext.Provider value={{ cards, setCards, resetCards }}>
            {children}
        </CardContext.Provider>
    );
};

// Custom Hook
export const useCards = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCards must be used within a CardProvider');
    }
    return context;
};
