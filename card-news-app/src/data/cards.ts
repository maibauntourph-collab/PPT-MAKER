// 📦 카드 콘텐츠 데이터
// 담당: 도다리 (총괄 기획)
// 설명: 카드 뉴스에 표시될 데이터를 정의합니다. 이 배열의 순서대로 카드가 표시됩니다.

export interface CardData {
  id: number;
  emoji: string;
  title: string;
  description: string;
  tag: string;
  gradient: string; // Tailwind CSS 그라디언트 클래스
}

export const cards: CardData[] = [
  {
    id: 1,
    emoji: "🌿",
    title: "유리의 3대 요소",
    description:
      "유리의 주성분인 규사(모래), 내구성을 높이는 석회석, 그리고 녹는점을 낮춰주는 '융제(알칼리)'가 필요합니다. 사탕수수는 여기서 핵심 역할을 합니다!",
    tag: "기초 과학",
    gradient: "from-green-600 via-emerald-600 to-teal-600",
  },
  {
    id: 2,
    emoji: "🔥",
    title: "바가스(Bagasse)의 힘",
    description:
      "사탕수수 즙을 짜고 남은 찌꺼기인 '바가스'는 유리 공장의 강력한 천연 연료입니다. 쓰레기를 줄이면서 엄청난 열 에너지를 만들어냅니다.",
    tag: "에너지 활용",
    gradient: "from-orange-500 via-red-500 to-yellow-500",
  },
  {
    id: 3,
    emoji: "⚗️",
    title: "마법의 가루, 식물 재",
    description:
      "바가스를 태운 재에는 칼륨과 나트륨이 풍부합니다. 이 알칼리 성분이 모래의 녹는점을 1,700도에서 1,000도로 뚝 떨어뜨려 유리를 만들기 쉽게 해줍니다.",
    tag: "화학 반응",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
  },
  {
    id: 4,
    emoji: "🍾",
    title: "설탕 산업과 유리병",
    description:
      "18세기 설탕 생산지에는 항상 유리 공장이 있었습니다. 사탕수수 찌꺼기로 에너지를 얻고, 그 재로 만든 병에 럼주를 담아 수출하는 '순환 경제'의 시작이었습니다.",
    tag: "역사 사례",
    gradient: "from-amber-600 via-brown-600 to-yellow-700",
  },
  {
    id: 5,
    emoji: "💡",
    title: "교수님의 요약",
    description:
      "사탕수수는 단순한 식재료가 아닙니다. 인류가 불의 온도를 정복하기 전부터 유리를 투명하게 빛나게 해준 진정한 과학의 동반자였답니다.",
    tag: "결론",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
  },
];
