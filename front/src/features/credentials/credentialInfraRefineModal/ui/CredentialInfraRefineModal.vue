<!--•	Props:
•	credentialId: 인프라 정제할 Credential의 ID.
•	Emit:
•	close: 모달 닫기 이벤트.
•	State:
•	infraDetails: 인프라 상세 정보 입력 상태.
•	추가적인 입력 필드가 필요하면 여기에 추가합니다.
•	Methods:
•	handleSubmit: 인프라 정제 데이터를 Credential Store에 업데이트.
•	handleCancel: 모달 닫기.
•	Template:
•	PModal: 인프라 정제 폼을 포함한 모달.
•	header: 모달 제목.
•	body: 인프라 상세 정보 입력 필드 및 추가 입력 필드.
•	footer: Cancel 및 Submit 버튼.
<script setup lang="ts">
import { PModal, PButton, PInput } from '@cloudforet-test/mirinae';
import { ref } from 'vue';
import { useCredentialStore } from '@/widgets/credentials/credentialsList/model/credentialStore.ts';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

interface iProps {
  credentialId: string;
}

const props = defineProps<iProps>();
const emit = defineEmits(['close']);

const infraDetails = ref<string>('');
// 추가적인 입력 필드들...

const credentialStore = useCredentialStore();

async function handleSubmit() {
  if (!infraDetails.value.trim()) {
    showErrorMessage('Error', 'Infra details are required');
    return;
  }

  try {
    await credentialStore.refineCredentialInfra(props.credentialId, {
      infraDetails: infraDetails.value,
    });
    showSuccessMessage('Success', 'Infra refined successfully');
    emit('close');
  } catch (error) {
    showErrorMessage('Error', 'Failed to refine infra');
  }
}

function handleCancel() {
  emit('close');
}
</script>

<template>
  <PModal :visible="true" @close="handleCancel">
    <template #header>
      <h2>Refine Infra</h2>
    </template>
    <template #body>
      <PInput
        v-model="infraDetails"
        placeholder="Infra Details"
        label="Details"
      />
      
    </template>
    <template #footer>
      <PButton @click="handleCancel">Cancel</PButton>
      <PButton type="primary" @click="handleSubmit">Submit</PButton>
    </template>
  </PModal>
</template>

<style scoped>

</style>-->
