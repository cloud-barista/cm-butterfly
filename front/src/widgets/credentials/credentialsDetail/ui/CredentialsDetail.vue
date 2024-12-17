<!-- front/src/widgets/credentials/credentialsDetail/CredentialDetail.vue -->
<script setup lang="ts">
import { ref, watchEffect, watch } from 'vue';
import { IConnectionConfig } from '@/entities/credentials/model/types.ts';
import { useCredentialDetailModel } from '@/widgets/credentials/credentialsDetail/model/credentialsDetailModel.ts';
import { PDefinitionTable } from '@cloudforet-test/mirinae';

// Props 정의
interface Props {
  credential: IConnectionConfig | null;
  isOpen: boolean;
}

// Props 수신
const props = defineProps<Props>();

const emit = defineEmits([
  'close',
  'update:custom-view-json-modal',
  'update:view-recommend-list-modal',
  'update:recommended-model-list',
  'update:credential-name',
  'update:credential-holder',
]);

// 모델 인스턴스
const { setCredentialId, initTable, tableModel } = useCredentialDetailModel();

// 내부 상태
const isOpen = ref(props.isOpen);
const credential = ref<IConnectionConfig | null>(props.credential);

// 초기화
initTable();

// Credential 데이터 설정
watchEffect(() => {
  if (props.credential) {
    setCredentialId(props.credential.configName); // configName을 ID로 사용
    credential.value = props.credential;
  } else {
    setCredentialId(null);
    credential.value = null;
  }
});

// Props 변경 시 내부 상태 업데이트
watch(
  () => props.isOpen,
  newVal => {
    isOpen.value = newVal;
  },
);

watch(
  () => props.credential,
  newVal => {
    credential.value = newVal;
    if (newVal) {
      setCredentialId(newVal.configName);
    }
  },
);

// 모달 닫힘 처리
function closeModal() {
  emit('close');
}

// Custom & View JSON 모달 열기 핸들러
function handleJsonModal() {
  emit('update:custom-view-json-modal', true);
  emit('update:credential-name', credential.value?.credentialName || '');
}

// View Recommended List 모달 열기 핸들러
function handleRecommendedList() {
  emit('update:view-recommend-list-modal', true);
  emit('update:recommended-model-list', []); // 추천 모델 리스트가 있을 경우 설정
}
</script>
<template>
  <p-button-modal
    v-model="isOpen"
    :visible="isOpen"
    size="lg"
    backdrop
    theme-color="info"
    header-title="Credential Details"
    @close="closeModal"
  >
    <div v-if="credential">
      <h3>{{ credential.configName }}</h3>
      <p>
        <strong>Credential Holder:</strong> {{ credential.credentialHolder }}
      </p>
      <p><strong>Credential Name:</strong> {{ credential.credentialName }}</p>
      <p><strong>Driver Name:</strong> {{ credential.driverName }}</p>
      <p><strong>Provider Name:</strong> {{ credential.providerName }}</p>
      <p><strong>Region:</strong> {{ credential.regionDetail.regionName }}</p>
      <p>
        <strong>Description:</strong> {{ credential.regionDetail.description }}
      </p>
      <p>
        <strong>Location:</strong>
        {{ credential.regionDetail.location.display }}
        (Lat: {{ credential.regionDetail.location.latitude }}, Lon:
        {{ credential.regionDetail.location.longitude }})
      </p>
      <p>
        <strong>Zones:</strong> {{ credential.regionDetail.zones.join(', ') }}
      </p>
      <p>
        <strong>Region Representative:</strong>
        {{ credential.regionRepresentative ? 'Yes' : 'No' }}
      </p>
      <p><strong>Verified:</strong> {{ credential.verified ? 'Yes' : 'No' }}</p>
      <!-- 추가적인 상세 정보가 필요하면 여기에 추가 -->

      <p-definition-table
        :fields="tableModel.tableState.fields"
        :data="tableModel.tableState.data"
        :loading="tableModel.tableState.loading"
        :block="true"
      >
        <template #data-customAndViewJSON>
          <p class="link-button-text" @click="handleJsonModal">
            Custom & View Credential
          </p>
        </template>
        <template #data-recommendModel>
          <p class="link-button-text" @click="handleRecommendedList">
            View Recommended List
          </p>
        </template>
      </p-definition-table>
    </div>
  </p-button-modal>
</template>

<style scoped>
.link-button-text {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}
</style>
