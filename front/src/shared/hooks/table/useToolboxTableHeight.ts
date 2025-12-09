import { ref, computed, onMounted, onUnmounted, nextTick, Ref, ComputedRef } from 'vue';

/**
 * Toolbox table height configuration options
 * 툴박스 테이블 높이 설정 옵션
 */
export interface ToolboxTableHeightOptions {
  defaultToolboxHeight?: number;      // 기본 툴박스 높이 (기본: 81px)
  pHorizontalLayoutOffset?: number;   // PHorizontalLayout 내부 고정 높이 (기본: 44px)
  debounceDelay?: number;             // 디바운스 지연 시간 (기본: 150ms)
  enableLogging?: boolean;            // 디버그 로깅 활성화 (기본: false)
}

/**
 * Toolbox table height return type
 * 툴박스 테이블 높이 반환 타입
 */
export interface ToolboxTableHeightReturn {
  toolboxTableRef: Ref<any>;              // 툴박스 테이블 컴포넌트 참조
  adjustedDynamicHeight: ComputedRef<number>; // 조정된 동적 높이
}

/**
 * Calculate and manage dynamic toolbox table height with responsive adjustment
 * 반응형 조정을 포함한 동적 툴박스 테이블 높이 계산 및 관리
 * 
 * This composable handles automatic height adjustment of PToolboxTable when the toolbox area
 * wraps to multiple lines due to screen width changes, sidebar toggles, or dev tools.
 * 
 * 이 컴포저블은 화면 폭 변경, 사이드바 토글, 개발자 도구 등으로 인해 툴박스 영역이
 * 여러 줄로 줄바꿈될 때 PToolboxTable의 자동 높이 조정을 처리합니다.
 * 
 * @param baseDynamicHeight - Base dynamic height from useDynamicTableHeight (accepts both Ref and ComputedRef) / useDynamicTableHeight에서 가져온 기본 동적 높이 (Ref와 ComputedRef 모두 허용)
 * @param options - Optional configuration / 선택적 설정
 * @returns Toolbox table reference and adjusted height / 툴박스 테이블 참조와 조정된 높이
 * 
 * @example
 * // 기본 사용법
 * const { dynamicHeight } = useDynamicTableHeight(
 *   computed(() => tableModel.tableState.items.length),
 *   computed(() => tableModel.tableOptions.pageSize)
 * );
 * 
 * const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(dynamicHeight);
 * 
 * // Template에서 사용:
 * // <PHorizontalLayout :height="adjustedDynamicHeight">
 * //   <PToolboxTable ref="toolboxTableRef" ... />
 * // </PHorizontalLayout>
 * 
 * @example
 * // 커스텀 설정 사용
 * const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
 *   dynamicHeight,
 *   {
 *     defaultToolboxHeight: 100,
 *     pHorizontalLayoutOffset: 120,
 *     debounceDelay: 200,
 *     enableLogging: true
 *   }
 * );
 */
export function useToolboxTableHeight(
  baseDynamicHeight: Ref<number> | ComputedRef<number>,
  options: ToolboxTableHeightOptions = {},
): ToolboxTableHeightReturn {
  // 기본값 설정
  const finalOptions = {
    defaultToolboxHeight: options.defaultToolboxHeight ?? 81,
    pHorizontalLayoutOffset: options.pHorizontalLayoutOffset ?? 44,
    debounceDelay: options.debounceDelay ?? 150,
    enableLogging: options.enableLogging ?? false,
  };

  // 내부 상태 관리
  const toolboxTableRef = ref<any>(null);
  const actualToolboxHeight = ref(finalOptions.defaultToolboxHeight);
  let resizeTimeout: NodeJS.Timeout | null = null;
  let resizeObserver: ResizeObserver | null = null;

  /**
   * Measure actual toolbox height from DOM
   * DOM에서 실제 툴박스 높이 측정
   */
  const updateToolboxHeight = () => {
    if (!toolboxTableRef.value?.$el) return;

    const toolboxElement = toolboxTableRef.value.$el.querySelector(
      '.p-toolbox-table .top-wrapper',
    );

    if (toolboxElement) {
      const height = toolboxElement.getBoundingClientRect().height;
      actualToolboxHeight.value = height;

      if (finalOptions.enableLogging) {
        console.log('[useToolboxTableHeight] Toolbox height measured:', height);
      }
    }
  };

  /**
   * Debounced resize handler
   * 디바운스된 리사이즈 핸들러
   */
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      updateToolboxHeight();
    }, finalOptions.debounceDelay);
  };

  /**
   * Adjusted dynamic height calculation
   * 조정된 동적 높이 계산
   * 
   * Adds the difference between actual and default toolbox height,
   * plus the PHorizontalLayout internal offset
   * 실제 툴박스 높이와 기본 툴박스 높이의 차이를 더하고,
   * PHorizontalLayout 내부 오프셋을 추가
   */
  const adjustedDynamicHeight = computed(() => {
    const baseHeight = baseDynamicHeight.value;
    const toolboxDiff = actualToolboxHeight.value - finalOptions.defaultToolboxHeight;
    const finalHeight = baseHeight + toolboxDiff + finalOptions.pHorizontalLayoutOffset;

    if (finalOptions.enableLogging) {
      console.log(
        '[useToolboxTableHeight] Height recalculated - Base:',
        baseHeight,
        'Toolbox:',
        actualToolboxHeight.value,
        'Offset:',
        finalOptions.pHorizontalLayoutOffset,
        'Final:',
        finalHeight,
      );
    }

    return finalHeight;
  });

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    nextTick(() => {
      updateToolboxHeight();

      // ResizeObserver 등록으로 툴박스 컨테이너 크기 변화 감지
      if (toolboxTableRef.value?.$el) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(toolboxTableRef.value.$el);

        if (finalOptions.enableLogging) {
          console.log('[useToolboxTableHeight] ResizeObserver registered for toolbox container');
        }
      }

      // Window resize 이벤트도 추가 (ResizeObserver 보조)
      window.addEventListener('resize', handleResize);
      if (finalOptions.enableLogging) {
        console.log('[useToolboxTableHeight] Window resize listener registered');
      }
    });
  });

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    window.removeEventListener('resize', handleResize);

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    if (finalOptions.enableLogging) {
      console.log('[useToolboxTableHeight] Cleanup completed');
    }
  });

  return {
    toolboxTableRef,
    adjustedDynamicHeight,
  };
}

