import BadWordsNext from "bad-words-next";
import en from "bad-words-next/lib/en";

const kor = [
  "시발",
  "씨발",
  "병신",
  "개새끼",
  "미친놈",
  "미친년",
  "존나",
  "좆",
  "좇",
  "지랄",
  "염병",
  "쌍놈",
  "걸레",
  "창녀",
  "보지",
  "자지",
  "후장",
  "딸딸",
  "ㅅㅂ",
  "ㅄ",
  "ㅈㄴ",
  "ㅈㄹ",
  "ㅊㄴ",
  "새끼",
  "허벌",
  "섹스",
  "씨발놈",
  "씨발롬",
  "시발롬",
  "시발놈",
  "시발련",
  "시발년",
  "애미",
  "애비",
  "후장",
  "ㄴㅇㅁ",
  "ㄴㄱ",
];

export const customWords = {
  ...en,
  words: [
    ...en.words,
    ...kor,
  ],
};

export const BAD_WORDS = new BadWordsNext({ data: customWords });
