import { BAD_WORDS, customWords } from "@/lib/badWords/badWords";
import { signupVal } from "@/utils/validations/signup/infoValidation";

export function normalize(text: string) {
   return text.toLowerCase().replace(/[^a-z가-힣]/g, '');
}

// 욕설 필터링
export function badWord_check (word: string) {
   const normalized = normalize(word);
   return BAD_WORDS.check(normalized) ||
   customWords.words.some((w) => normalized.includes(w));
}

// 지정한 문자열 길이 확인해서 true false 반환
export function stringLengthBoolean (value: string, min: number, max: number) {
   return (value.length < min || value.length > max) 
   && value.length !== 0;
}

// 회원정보 replace 필터
export function inputReplaceFilter (inputName: string, word: string) {

   return [signupVal.pw.key, signupVal.pwCheck.key].includes(inputName)
      ? word.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "")
      : word.replace(/[\s!@#$%^&*()+=\[\]{};:'",<>/?\\|`~_-]/g, "");
}