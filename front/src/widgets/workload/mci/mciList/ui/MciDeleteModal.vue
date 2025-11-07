<script setup lang="ts">
import {
  PButtonModal,
  PFieldGroup,
  PRadio,
  PRadioGroup,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { computed, reactive, watch } from 'vue';
import { useDeleteMci } from '@/entities/mci/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

interface IProps {
  visible: boolean;
  selectedMciList: any[];
  nsId: string;
}

interface IEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'deleted'): void;
}

const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();

const state = reactive({
  deleteMethod: 'normal',
  confirmKeyword: '',
  isDeleting: false,
});

const checkKeyword = computed(() => {
  return props.selectedMciList.length === 1
    ? props.selectedMciList[0].name
    : '전체삭제';
});

const isDeleteDisabled = computed(() => {
  return state.confirmKeyword !== checkKeyword.value;
});

const deleteMethodOptions = [
  { label: '정상 삭제', key: 'normal' },
  { label: '강제 삭제', key: 'force' },
];

async function handleConfirm() {
  state.isDeleting = true;
  try {
    const deletePromises = props.selectedMciList.map(mci => {
      const params = {
        nsId: props.nsId,
        mciId: mci.name,
      };
      return useDeleteMci(params).execute();
    });

    await Promise.all(deletePromises);

    const count = props.selectedMciList.length;
    showSuccessMessage(
      '삭제 완료',
      `${count}개의 워크로드가 성공적으로 삭제되었습니다.`,
    );

    emit('update:visible', false);
    emit('deleted');

    // Reset state
    state.deleteMethod = 'normal';
    state.confirmKeyword = '';
  } catch (error: any) {
    showErrorMessage('Error', error);
  } finally {
    state.isDeleting = false;
  }
}

function handleClose() {
  if (state.isDeleting) return; // 삭제 중에는 닫기 방지
  emit('update:visible', false);
  state.deleteMethod = 'normal';
  state.confirmKeyword = '';
}

watch(
  () => props.visible,
  newVal => {
    if (!newVal) {
      state.deleteMethod = 'normal';
      state.confirmKeyword = '';
      state.isDeleting = false;
    }
  },
);
</script>

<template>
  <p-button-modal
    :visible="visible"
    :header-title="'워크로드 전체 삭제'"
    size="sm"
    :disabled="isDeleteDisabled"
    :loading="state.isDeleting"
    @confirm="handleConfirm"
    @close="handleClose"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #body>
      <div class="delete-modal-content">
        <div class="warning-banner">
          ⚠️ 워크로드를 삭제하면 워크로드에 포함된
          <span class="keyword-highlight">모든 리소스도 함께 삭제</span>되므로
          짧게는 몇 분에서
          <span class="keyword-highlight">길게는 몇 시간</span>이 소요될 수
          있습니다
        </div>
        <p class="description">아래 워크로드들이 삭제됩니다</p>
        <div class="mci-list">
          <div v-for="mci in selectedMciList" :key="mci.name" class="mci-item">
            {{ mci.name }}
          </div>
        </div>

        <p-field-group label="삭제 방법" required class="mt-8">
          <div
            v-if="state.deleteMethod === 'force'"
            class="force-warning-banner"
          >
            🚨 CSP의 삭제 결과와 무관하게 모든 자원 및 내부 메타데이터를 강제로
            제거합니다
          </div>
          <p-radio-group>
            <p-radio
              v-for="option in deleteMethodOptions"
              :key="option.key"
              v-model="state.deleteMethod"
              :value="option.key"
            >
              <span>{{ option.label }}</span>
            </p-radio>
          </p-radio-group>
        </p-field-group>

        <p-field-group required class="mt-8">
          <template #label>
            <span
              >계속하려면
              <span class="keyword-highlight">{{ checkKeyword }}</span
              >를 입력하세요</span
            >
          </template>
          <p-text-input
            v-model="state.confirmKeyword"
            :placeholder="checkKeyword"
          />
        </p-field-group>
      </div>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.delete-modal-content {
  .warning-banner {
    padding: 12px;
    margin-bottom: 16px;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 14px;
    line-height: 1.5;
  }

  .description {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .mci-list {
    padding: 12px;
    background-color: #f7f7f7;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;

    .mci-item {
      padding: 4px 0;
      font-size: 14px;
      font-family: monospace;
    }
  }

  .force-warning-banner {
    padding: 12px;
    margin-bottom: 8px;
    background-color: #fee;
    border: 1px solid #e53e3e;
    border-radius: 4px;
    color: #c53030;
    font-size: 14px;
    line-height: 1.5;
  }

  .keyword-highlight {
    color: #e53e3e;
    font-weight: bold;
  }
}
</style>
