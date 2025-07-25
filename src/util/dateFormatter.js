// utils/dateFormatter.js

/**
 * 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
 * @param {string|number} dateStr - 8자리 날짜 (예: 20011203)
 * @returns {string|null} 변환된 날짜 또는 유효하지 않은 경우 null
 */
export function formatDateString(dateStr) {
  const raw = String(dateStr);

  if (!/^\d{8}$/.test(raw)) return null;

  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);

  const date = new Date(`${year}-${month}-${day}`);
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day)
  ) {
    return null; // 유효하지 않은 날짜
  }

  return `${year}.${month}.${day}`;
}
