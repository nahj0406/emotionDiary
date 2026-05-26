export function normalize(text: string) {
   return text.toLowerCase().replace(/[^a-z가-힣]/g, '');
}