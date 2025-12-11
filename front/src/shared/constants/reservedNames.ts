/**
 * System reserved names that users cannot use
 * 사용자가 사용할 수 없는 시스템 예약어
 * 
 * - __main_workflow__: Main workflow TaskGroup (CM-Cicada Flat structure)
 *   모든 task를 포함하는 단일 Flat TaskGroup
 */

export const RESERVED_NAMES: string[] = [];

/**
 * Check if a name matches the reserved pattern
 * 예약어 패턴에 일치하는지 확인
 * 
 * @param name - Name to check
 * @returns true if matches reserved pattern
 */
export function isReservedRootTaskGroupPattern(name: string): boolean {
  return name.startsWith('__root_task_group_') && name.endsWith('__');
}

/**
 * Check if a name is reserved by the system
 * 이름이 시스템 예약어인지 확인
 * 
 * @param name - Name to check
 * @returns true if reserved, false otherwise
 */
export function isReservedName(name: string): boolean {
  return RESERVED_NAMES.includes(name) || isReservedRootTaskGroupPattern(name);
}

/**
 * Get error message for reserved name
 * 예약어 에러 메시지 반환
 * 
 * @param name - Reserved name
 * @returns Error message
 */
export function getReservedNameError(name: string): string {
  if (isReservedRootTaskGroupPattern(name)) {
    return `"${name}" matches a reserved system pattern (__root_task_group_*__). Please use a different name.`;
  }
  return `"${name}" is reserved by the system. Please use a different name.`;
}


