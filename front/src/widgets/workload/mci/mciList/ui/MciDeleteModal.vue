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
    : 'Delete All';
});

const isDeleteDisabled = computed(() => {
  return state.confirmKeyword !== checkKeyword.value;
});

const deleteMethodOptions = [
  { label: 'Normal Delete', key: 'normal' },
  { label: 'Force Delete', key: 'force' },
];

async function handleConfirm() {
  state.isDeleting = true;
  try {
    const deletePromises = props.selectedMciList.map(mci => {
      const params: any = {
        nsId: props.nsId,
        mciId: mci.name,
      };
      // Set option based on delete method
      if (state.deleteMethod === 'force') {
        params.option = 'force';
      } else {
        // Normal Delete
        params.option = 'terminate';
      }
      return useDeleteMci(params).execute();
    });

    await Promise.all(deletePromises);

    const count = props.selectedMciList.length;
    showSuccessMessage(
      'Delete Complete',
      `${count} workload(s) have been successfully deleted.`,
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
    header-title="Delete Workloads"
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
          ⚠️ Deleting workloads will also delete
          <span class="keyword-highlight"
            >all resources included in the workloads</span
          >
          which may take
          <span class="keyword-highlight"
            >from a few minutes to several hours</span
          >
        </div>
        <p class="description">The following workloads will be deleted</p>
        <div class="mci-list">
          <div v-for="mci in selectedMciList" :key="mci.name" class="mci-item">
            {{ mci.name }}
          </div>
        </div>

        <p-field-group label="Delete Method" required class="mt-8">
          <div
            v-if="state.deleteMethod === 'force'"
            class="force-warning-banner"
          >
            🚨 Force removes all resources and internal metadata regardless of
            CSP deletion results
          </div>
          <p-radio-group>
            <p-radio
              v-for="option in deleteMethodOptions"
              :key="option.key"
              v-model="state.deleteMethod"
              :value="option.key"
              :disabled="state.isDeleting"
            >
              <span>{{ option.label }}</span>
            </p-radio>
          </p-radio-group>
        </p-field-group>

        <p-field-group required class="mt-8">
          <template #label>
            <span
              >To continue, please enter
              <span class="keyword-highlight">{{ checkKeyword }}</span></span
            >
            <p-text-input
              v-model="state.confirmKeyword"
              :placeholder="checkKeyword"
              :disabled="state.isDeleting"
            />
          </template>
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
