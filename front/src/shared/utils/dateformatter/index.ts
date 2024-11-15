export function formatDate(
  date: Date | string,
  format: string = 'yyyy-MM-dd HH:mm:ss',
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }

    const map: { [key: string]: string } = {
      yyyy: d.getFullYear().toString(),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      dd: String(d.getDate()).padStart(2, '0'),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
      ss: String(d.getSeconds()).padStart(2, '0'),
    };

    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, matched => map[matched]);
  } catch (e) {
    return '';
  }
}

export function formatDateWithMilliseconds(
  date: Date | string,
  format: string = 'yyyy-MM-dd HH:mm:ss.SSS',
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }

    const map: { [key: string]: string } = {
      yyyy: d.getFullYear().toString(),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      dd: String(d.getDate()).padStart(2, '0'),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
      ss: String(d.getSeconds()).padStart(2, '0'),
      SSS: String(d.getMilliseconds()).padStart(3, '0'), // 밀리세컨드 추가
    };

    return format.replace(/yyyy|MM|dd|HH|mm|ss|SSS/g, matched => map[matched]);
  } catch (e) {
    return '';
  }
}
