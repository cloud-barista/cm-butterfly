export function parseRequestBody(requestBodyString: string): object {
  try {
    // JSON.parse를 사용하여 문자열을 객체로 변환
    const parsedObject = JSON.parse(requestBodyString);
    return parsedObject;
  } catch (error) {
    return {};
  }
}
