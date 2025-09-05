<!-- src/pages/cloudResources/cloudCredentials/ui/CredentialPage.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { PButton, PTab } from '@cloudforet-test/mirinae';
import CustomViewCredential from '@/widgets/credentials/customViewCredential/ui/CustomViewCredential.vue';
import CredentialsList from '@/widgets/credentials/credentialsList/ui/CredentialsList.vue';
import CredentialsDetail from '@/widgets/credentials/credentialsDetail/ui/CredentialsDetail.vue';
import { showSuccessMessage } from '@/shared/utils';

// const selectedCredentialName = ref<string>('');
const selectedCredentialName = ref<{ id: string } | null>(null);
const pageName = 'Cloud Credentials';

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
const modalStates = reactive({
  addCredentialGroup: {
    open: false,
    category: 'add',
    confirm() {
      modalStates.addCredentialGroup.open = false;
    },
    trigger: false,
    updateTrigger() {
      modalStates.addCredentialGroup.trigger = false;
    },
  },
});

// 모달 핸들러
function handleCredentialEdit() {
  showSuccessMessage('Info', 'Edit functionality is currently disabled.');
}
// Add Credential 핸들러
function handleAddCredential() {
  modalStates.addCredentialGroup.open = true;
  getCredentialList();
  // modalStates.addServiceGroup.open = !value;
  // modalStates.addSourceConnection.open = value;
  // isCollapsed.value = value;
  // isGnbToolboxShown.value = !value;
}

// // Edit Credential 핸들러
// function handleCredentialEdit() {
//   if (selectedCredentialName.value) {
//     modalStates.editCredentialGroup.open = true;
//   } else {
//     showErrorMessage('Error', '편집할 Credential을 선택해주세요.');
//   }
// }

// let data = computed(() => selectedCredentialName.value?.id);
// Credential 선택 핸들러
// function handleClickCredentialName(credential: { id: string }) {
//   selectedCredentialName.value = credential;
//   data = selectedCredentialName.value?.id;
//   console.log('추출된 id 값:', data);
//   console.log('추출된 id 값:', typeof data);
//   console.log('선택된 Credential Name:', credential);
//   console.log('selectedCredentialName:', selectedCredentialName.value);

//   // data를 필요한 곳에 사용
// }

// function handleClickCredentialName(credential: { id: string }) {
//   selectedCredentialName.value = credential;
//   console.log('선택된 Credential Name:', credential.id);
// }
function handleClickCredentialName(credential: { id: string }) {
  selectedCredentialName.value = credential;
}

// 모달 관련 핸들러 (필요 시 구현)
// 모달에서 트리거된 이벤트 처리
function handleAddCredentialTrigger() {
  showSuccessMessage('Success', 'Credential이 성공적으로 추가되었습니다.');
  modalStates.addCredentialGroup.trigger = true;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <CredentialsList
        :add-modal-state="modalStates.addCredentialGroup.open"
        :trigger="modalStates.addCredentialGroup.trigger"
        @select-row="handleClickCredentialName"
        @update:addModalState="e => (modalStates.addCredentialGroup.open = e)"
        @update:trigger="modalStates.addCredentialGroup.trigger = false"
        @update:title="e => (modalStates.addCredentialGroup.category = e)"
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
            <CredentialsDetail
              :selectedCredentialName="selectedCredentialName?.id"
            />
          </template>
          <template #usage>
            <div class="tab-section-header">
              <p>Credential Usage</p>
            </div>
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-70">
      <custom-view-credential
        v-if="modalStates.addCredentialGroup.open"
        @update:isModalOpened="
          () => (modalStates.addCredentialGroup.open = false)
        "
        @update:is-connection-modal-opened="handleAddCredential"
        @update:trigger="modalStates.addCredentialGroup.trigger = true"
      />
    </div>
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
