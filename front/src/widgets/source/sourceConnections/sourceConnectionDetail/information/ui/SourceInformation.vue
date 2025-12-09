<script setup lang="ts">
import { useSourceInformationModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/information/model/sourceInformationModel';
import { onBeforeMount, watch } from 'vue';
import { PDefinitionTable, PI } from '@cloudforet-test/mirinae';

interface IProps {
  connectionId: string | null;
}

const props = defineProps<IProps>();

const { setConnectionId, defineTableModel, initTable } =
  useSourceInformationModel();

/**
 * Truncate text with ellipsis
 * 텍스트를 지정된 길이로 자르고 ... 을 추가합니다.
 * 
 * @param {string} text - Text to truncate / 자를 텍스트
 * @param {number} maxLength - Maximum length (default: 10) / 최대 길이 (기본값: 10)
 * @returns {string} Truncated text / 잘린 텍스트
 */
const truncateText = (text: string, maxLength: number = 10): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Copy text to clipboard
 * 텍스트를 클립보드에 복사합니다.
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text || '');
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

watch(
  props,
  () => {
    setConnectionId(props.connectionId);
  },
  { immediate: true },
);
onBeforeMount(() => {
  initTable();
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="defineTableModel.tableState.fields"
      :data="defineTableModel.tableState.data"
      :loading="defineTableModel.tableState.loading"
    >
      <template #data-user="{ data }">
        <div class="sensitive-field">
          <span>{{ truncateText(data) }}</span>
          <button class="copy-btn" @click="copyToClipboard(data)">
            <p-i name="ic_copy" width="1rem" height="1rem" />
          </button>
        </div>
      </template>
      <template #data-password="{ data }">
        <div class="sensitive-field">
          <span>{{ truncateText(data.replaceAll(/./g, '*')) }}</span>
          <button class="copy-btn" @click="copyToClipboard(data)">
            <p-i name="ic_copy" width="1rem" height="1rem" />
          </button>
        </div>
      </template>
      <template #data-privateKey="{ data }">
        <div class="sensitive-field">
          <span>{{ truncateText(data) }}</span>
          <button class="copy-btn" @click="copyToClipboard(data)">
            <p-i name="ic_copy" width="1rem" height="1rem" />
          </button>
        </div>
      </template>
      <template #data-publicKey="{ data }">
        <div class="sensitive-field">
          <span>{{ truncateText(data) }}</span>
          <button class="copy-btn" @click="copyToClipboard(data)">
            <p-i name="ic_copy" width="1rem" height="1rem" />
          </button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss">
.sensitive-field {
  @apply inline-flex items-center gap-2;
}

.copy-btn {
  @apply cursor-pointer bg-transparent border-none p-1 opacity-60 hover:opacity-100 transition-opacity;
  display: inline-flex;
  align-items: center;
}
</style>
