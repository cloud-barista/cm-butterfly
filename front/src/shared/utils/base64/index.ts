/**
 * Encode a string to Base64
 * 문자열을 Base64로 인코딩합니다
 * 
 * @param {string} text - The text to encode / 인코딩할 텍스트
 * @returns {string} Base64 encoded string / Base64로 인코딩된 문자열
 * 
 * @example
 * const encoded = encodeBase64('Hello World');
 * console.log(encoded); // 'SGVsbG8gV29ybGQ='
 */
export function encodeBase64(text: string): string {
  try {
    if (!text) {
      return '';
    }
    // Use btoa for browser environment
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    console.error('Base64 encoding error:', error);
    return text;
  }
}

/**
 * Decode a Base64 string
 * Base64 문자열을 디코딩합니다
 * 
 * @param {string} encoded - The Base64 encoded string / Base64로 인코딩된 문자열
 * @returns {string} Decoded string / 디코딩된 문자열
 * 
 * @example
 * const decoded = decodeBase64('SGVsbG8gV29ybGQ=');
 * console.log(decoded); // 'Hello World'
 */
export function decodeBase64(encoded: string): string {
  try {
    if (!encoded) {
      return '';
    }
    // Use atob for browser environment
    return decodeURIComponent(escape(atob(encoded)));
  } catch (error) {
    console.error('Base64 decoding error:', error);
    return encoded;
  }
}
