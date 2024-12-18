<!-- src/pages/cloudResources/cloudCredentials/ui/CredentialPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import CredentialsList from '@/widgets/credentials/credentialsList/ui/CredentialsList.vue';
import CredentialsDetail from '@/widgets/credentials/credentialsDetail/ui/CredentialsDetail.vue';
import { showSuccessMessage } from '@/shared/utils';

// const selectedCredentialName = ref<string>('');
const selectedCredentialName = ref<{ id: string } | null>(null);
const isCredentialEditBtnClicked = ref<boolean>(false);

// 메인 탭 상태
const mainTabState = ref({
  activeTab: 'details',
  tabs: [
    { name: 'details', label: 'Details' },
    { name: 'usage', label: 'Usage' },
  ],
});

// Credential Detail 탭 상태 (필요 시)
const credentialDetailTabState = ref({
  activeTab: 'information',
  tabs: [
    { name: 'information', label: 'Information' },
    { name: 'usageCollect', label: 'Usage Collect' },
  ],
});

// 모달 상태
const modalStates = ref({
  addCredential: {
    open: false,
    category: 'add',
    trigger: false,
  },
});

// 모달 핸들러
function handleCredentialEdit() {
  showSuccessMessage('Info', 'Edit functionality is currently disabled.');
}

function handleAddCredential() {
  showSuccessMessage('Info', 'Add functionality is currently disabled.');
}
let data = computed(() => selectedCredentialName.value?.id);
// Credential 선택 핸들러
function handleClickCredentialName(credential: { id: string }) {
  selectedCredentialName.value = credential;
  data = selectedCredentialName.value?.id;
  console.log('추출된 id 값:', data);
  console.log('추출된 id 값:', typeof data);
  console.log('선택된 Credential Name:', credential);
  console.log('selectedCredentialName:', selectedCredentialName.value);

  // data를 필요한 곳에 사용
}

// 모달 관련 핸들러 (필요 시 구현)
function handleGroupModal(value: boolean) {}
</script>

<template>
  <div class="credential-page page">
    <header
      v-if="!modalStates.addCredential.open"
      class="credential-page-header"
    >
      <p>Cloud Credentials</p>
      <p-button icon-left="ic_add" @click="handleAddCredential">
        Add Credential
      </p-button>
    </header>
    <section class="credential-page-body">
      <CredentialsList
        :add-modal-state="modalStates.addCredential.open"
        :trigger="modalStates.addCredential.trigger"
        @select-row="handleClickCredentialName"
        @update:addModalState="e => (modalStates.addCredential.open = e)"
        @update:trigger="modalStates.addCredential.trigger = false"
        @update:title="e => (modalStates.addCredential.category = e)"
      />
      <p v-if="!selectedCredentialName" class="no-selection-message">
        Select an item for more details.
      </p>
      <div v-if="selectedCredentialName">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Credential Details</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="handleCredentialEdit"
              >
                Edit
              </p-button>
            </div>
            <CredentialsDetail :selectedCredentialName="data" />
          </template>
          <template #usage>
            <div class="tab-section-header">
              <p>Credential Usage</p>
              <!-- Credential Usage 컴포넌트가 필요하다면 추가 -->
            </div>
            <!-- 필요 시 Credential Usage 컴포넌트 추가 -->
          </template>
        </p-tab>
      </div>
    </section>
    <!-- 모달 관련 코드 제거 -->
    <div class="relative z-70"></div>
  </div>
</template>

<style scoped>
.credential-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 추가 스타일 */
}

.no-selection-message {
  text-align: center;
  color: gray;
  font-size: 14px;
}

.modal-container {
  position: relative;
  z-index: 60;
}
</style>
