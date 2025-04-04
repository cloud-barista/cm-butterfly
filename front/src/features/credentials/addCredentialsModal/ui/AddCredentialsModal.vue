<!--
  State:
credentialName: Credential 이름 입력 상태.
추가적인 입력 필드가 필요하면 여기에 추가합니다.
Methods:
handleSubmit: Credential 추가 로직.
handleCancel: 모달 닫기.
Template:
PModal: Credential 추가 폼을 포함한 모달.
header: 모달 제목.
body: Credential 이름 입력 필드 및 추가 입력 필드.
footer: Cancel 및 Submit 버튼.-->
<script setup lang="ts">
import { PModal, PButton, PInput } from '@cloudforet-test/mirinae';
import { ref } from 'vue';
import { useCredentialStore } from '@/widgets/credentials/credentialsList/model/credentialStore.ts';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

const emit = defineEmits(['update:isModalOpened', 'update:trigger']);

const credentialName = ref<string>('');
// 추가적인 입력 필드들...

const credentialStore = useCredentialStore();

async function handleSubmit() {
  if (!credentialName.value.trim()) {
    showErrorMessage('Error', 'Credential name is required');
    return;
  }

  try {
    await credentialStore.addNewCredential({ name: credentialName.value });
    showSuccessMessage('Success', 'Credential added successfully');
    emit('update:isModalOpened', false);
    emit('update:trigger', true);
  } catch (error) {
    showErrorMessage('Error', 'Failed to add credential');
  }
}

function handleCancel() {
  emit('update:isModalOpened', false);
}
</script>

<template>
  <PModal :visible="true" @close="handleCancel">
    <template #header>
      <h2>Add Credential</h2>
    </template>
    <template #body>
      <PInput
        v-model="credentialName"
        placeholder="Credential Name"
        label="Name"
      />
      <!-- 추가 입력 필드들 -->
    </template>
    <template #footer>
      <PButton @click="handleCancel">Cancel</PButton>
      <PButton type="primary" @click="handleSubmit">Submit</PButton>
    </template>
  </PModal>
</template>

<style scoped>
/* 필요한 스타일 추가 */
</style>
