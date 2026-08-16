const REGIONAL_INDICATOR_OFFSET = 127397; // 'A'.codePointAt(0) → 🇦 로 변환하는 오프셋

// nationality가 온보딩 전(null)이거나 alpha-2가 아니면 기본 지구본 이모지로 대체
export function getCountryFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';

  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.codePointAt(0) + REGIONAL_INDICATOR_OFFSET))
    .join('');
}
