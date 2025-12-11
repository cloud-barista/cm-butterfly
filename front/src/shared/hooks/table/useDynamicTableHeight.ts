import { computed, Ref } from 'vue';


/**
 * Dynamic table height configuration
 * 동적 테이블 높이 설정
 */
export interface DynamicTableHeightConfig {
  tableRowHeight?: number;       // 테이블 행 높이 (기본: 40px)
  tableHeaderHeight?: number;     // 테이블 헤더 높이 (기본: 32px)
  toolboxHeight?: number;         // 툴박스 영역 높이 (기본: 81px)
  paginationHeight?: number;      // 페이지네이션 높이 (기본: 0px - toolbox에 포함됨)
  minTableHeight?: number;        // 최소 높이 - 1개 row 기준 (기본: 193px)
  maxTableHeight?: number;        // 최대 높이 - 데이터 많을 때 제한 (기본: 1000px)
  additionalPadding?: number;     // DataTable 내부 padding (기본: 10px)
  enableLogging?: boolean;        // 디버그 로깅 활성화 (기본: false)
}

/**
 * Dynamic table height return type
 */
export interface DynamicTableHeightReturn {
  dynamicHeight: Ref<number>;     // 동적으로 계산된 높이
  minHeight: number;              // 최소 높이
  maxHeight: number;              // 최대 높이
  config: Required<DynamicTableHeightConfig>; // 설정값
}

/**
 * Calculate dynamic table height based on data count
 * 데이터 개수에 따라 동적으로 테이블 높이를 계산합니다.
 * 
 * @param itemCount - Reactive reference to item count / 아이템 개수에 대한 반응형 참조
 * @param pageSize - Reactive reference to page size / 페이지 사이즈에 대한 반응형 참조
 * @param config - Optional configuration / 선택적 설정
 * @returns Dynamic height values / 동적 높이 값들
 * 
 * @example
 * // 기본 설정 사용
 * const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
 *   computed(() => tableModel.tableState.displayItems.length),
 *   computed(() => tableModel.tableOptions.pageSize)
 * );
 * 
 * @example
 * // 커스텀 설정 사용
 * const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
 *   computed(() => tableModel.tableState.displayItems.length),
 *   computed(() => tableModel.tableOptions.pageSize),
 *   {
 *     tableRowHeight: 60,
 *     additionalPadding: 20,
 *   }
 * );
 */
export function useDynamicTableHeight(
  itemCount: Ref<number>,
  pageSize: Ref<number>,
  config: DynamicTableHeightConfig = {},
): DynamicTableHeightReturn {
  // 기본값 설정 (실제 DOM 측정값 기반)
  const finalConfig: Required<DynamicTableHeightConfig> = {
    tableRowHeight: config.tableRowHeight ?? 40,        // 실제 측정: 40px
    tableHeaderHeight: config.tableHeaderHeight ?? 32,   // 실제 측정: 32px
    toolboxHeight: config.toolboxHeight ?? 81,          // 실제 측정: 81px (pagination 포함)
    paginationHeight: config.paginationHeight ?? 0,      // toolbox에 포함되어 있으므로 0
    minTableHeight: config.minTableHeight ?? 193,        // 81 + 32 + 40 + 40 = 193px (1개 row + DataTable 내부 padding)
    maxTableHeight: config.maxTableHeight ?? 1000,
    additionalPadding: config.additionalPadding ?? 10,   // DataTable 내부 padding
    enableLogging: config.enableLogging ?? false,
  };

  // 동적 높이 계산
  const dynamicHeight = computed(() => {
    // null/undefined 체크 강화
    const count = itemCount.value ?? 0;
    const size = pageSize.value ?? 15;

    // 데이터가 없으면 최소 높이 반환
    if (count === 0) {
      if (finalConfig.enableLogging) {
        console.log('[useDynamicTableHeight] No data, returning minTableHeight:', finalConfig.minTableHeight);
      }
      return finalConfig.minTableHeight;
    }

    // 실제 표시될 행 개수 (pageSize와 실제 데이터 개수 중 작은 값)
    const displayRowCount = Math.min(count, size);

    // 계산된 높이 = 툴박스 + 헤더 + (행 높이 * 행 개수) + 페이지네이션 + 추가 패딩
    const calculatedHeight =
      finalConfig.toolboxHeight +
      finalConfig.tableHeaderHeight +
      finalConfig.tableRowHeight * displayRowCount +
      finalConfig.paginationHeight +
      finalConfig.additionalPadding;

    const finalHeight = Math.min(calculatedHeight, finalConfig.maxTableHeight);

    if (finalConfig.enableLogging) {
      console.log('[useDynamicTableHeight] Calculation:', {
        itemCount: count,
        pageSize: size,
        displayRowCount,
        breakdown: {
          toolboxHeight: finalConfig.toolboxHeight,
          tableHeaderHeight: finalConfig.tableHeaderHeight,
          rowsHeight: finalConfig.tableRowHeight * displayRowCount,
          paginationHeight: finalConfig.paginationHeight,
          additionalPadding: finalConfig.additionalPadding,
        },
        calculatedHeight,
        finalHeight,
      });
    }

    // 데이터가 있을 때는 최대 높이만 제한 (최소 높이 체크 안함)
    return finalHeight;
  });

  return {
    dynamicHeight,
    minHeight: finalConfig.minTableHeight,
    maxHeight: finalConfig.maxTableHeight,
    config: finalConfig,
  };
}

