<!-- src/widgets/credentials/credentialsDetail/ui/CredentialsDetail.vue -->
<script setup lang="ts">
import { defineProps, onBeforeMount, watch } from 'vue';
import { useCredentialsDetailModel } from '@/widgets/credentials/credentialsDetail/model/credentialsDetailModel';
import { PDefinitionTable } from '@cloudforet-test/mirinae'; // PDefinitionTable 임포트

interface IProps {
  selectedCredentialName: string;
}

const props = defineProps<IProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:view-recommend-list-modal',
  'update:credential-name',
  'update:credential-description',
  'update:recommended-credential-list',
]);

const { setCredentialName, initTable, tableModel } =
  useCredentialsDetailModel();

// 선택된 Credential Name 설정
setCredentialName(props.selectedCredentialName);

// 테이블 초기화
onBeforeMount(() => {
  initTable();
});

// 선택된 Credential Name이 변경될 때마다 설정
watch(
  () => props.selectedCredentialName,
  newName => {
    console.log('123123123', newName);
    setCredentialName(newName);
  },
);

// JSON 보기 핸들러
function handleJsonModal() {
  emit('update:custom-view-json-modal', true);
  emit('update:credential-name', tableModel.tableState.data.credentialName);
}

// 추천 모델 보기 핸들러 (필요 시 구현)
function handleRecommendedList() {
  // 예시: emit('update:view-recommend-list-modal', true);
  // 필요에 따라 로직 추가
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      :block="true"
    >
      <template #data-customAndViewJSON="{ row }">
        <p class="link-button-text" @click="handleJsonModal">
          Custom & View JSON
        </p>
      </template>
      <template #data-recommendModel="{ row }">
        <p class="link-button-text" @click="handleRecommendedList">
          View Recommended List
        </p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss">
.link-button-text {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}
</style>
