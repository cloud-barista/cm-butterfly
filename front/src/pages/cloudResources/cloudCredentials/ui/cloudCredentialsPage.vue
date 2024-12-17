<!--•	Imports: 필요한 컴포넌트와 스토어를 적절한 경로로 임포트합니다.
•	Data: 기존 코드에서 필요하지 않은 컴포넌트 import 제거에 맞게 데이터를 설정합니다.
•	Computed:
•	credentialsStore: Credential Store 접근.
•	dataComputed: 선택된 Usage ID에 대한 데이터.
•	Watchers:
•	selectedUsageId: 선택된 Usage ID에 따라 상세 데이터 업데이트.
•	Methods:
•	handleCredentialEdit: Credential 편집 모달 열기.
•	handleAddCredential: Credential 추가 모달 열기.
•	handleClickCredentialId: Credential 선택 시 ID 설정.
•	handleGroupModal: 모달 상태 업데이트.
•	Template:
•	Header: Credential 목록과 Add 버튼.
•	CredentialsList: Credential 목록을 표시하는 컴포넌트.
•	CredentialsDetail: 선택된 Credential의 상세 정보를 표시하는 컴포넌트.
•	AddCredentialsModal: Credential 추가 모달 컴포넌트.-->
<!-- src/pages/cloudResources/cloudCredentials/ui/CredentialPage.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import CredentialsList from '@/widgets/credentials/credentialsList/ui/CredentialsList.vue';
import CredentialsDetail from '@/widgets/credentials/credentialsDetail/ui/CredentialsDetail.vue';
// import AddCredentialsModal from '@/features/credentials/addCredentialsModal/ui/AddCredentialsModal.vue'; // 모달 제거
// import { useCredentialStore } from '@/widgets/credentials/credentialsList/model/credentialStore.ts';
import { showSuccessMessage } from '@/shared/utils';

const selectedCredentialId = ref<string>('');
const isCredentialEditBtnClicked = ref<boolean>(false);

// const credentialStore = useCredentialStore();

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

// 모달
function handleCredentialEdit() {
  showSuccessMessage('Info', 'Edit functionality is currently disabled.');
}

// 모달
function handleAddCredential() {
  showSuccessMessage('Info', 'Add functionality is currently disabled.');
}

function handleClickCredentialId(id: string) {
  selectedCredentialId.value = id;
}

// 모달
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
        @selectRow="handleClickCredentialId"
        @update:addModalState="e => (modalStates.addCredential.open = e)"
        @update:trigger="modalStates.addCredential.trigger = false"
        @update:title="e => (modalStates.addCredential.category = e)"
      />
      <p v-if="!selectedCredentialId" class="no-selection-message">
        Select an item for more details.
      </p>
      <div v-if="selectedCredentialId">
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
            <CredentialsDetail :credential-id="selectedCredentialId" />
          </template>
          <template #usage>
            <div class="tab-section-header">
              <p>Credential Usage</p>
            </div>
            <!-- CredentialsUsage 컴포넌트가 필요하다면 유지하고, 필요 없다면 제거 -->
            <!-- 현재 구현 방향에 따라 결정 -->
          </template>
        </p-tab>
      </div>
    </section>
    <!-- 모달 관련 코드 제거 -->
    <!--
    <div class="modal-container">
      <AddCredentialsModal
        v-if="modalStates.addCredential.open && !isCredentialEditBtnClicked"
        @update:isModalOpened="() => (modalStates.addCredential.open = false)"
        @update:trigger="modalStates.addCredential.trigger = true"
      />
      
    </div>
    -->
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
