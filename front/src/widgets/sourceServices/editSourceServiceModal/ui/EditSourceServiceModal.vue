<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, ref, watchEffect, computed } from 'vue';
import { useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { UpdateSourceService } from '@/features/sourceServices';

const sourceServiceStore = useSourceServiceStore();

const { sourceConnectionNameList, sourceServiceInfo } =
  storeToRefs(sourceServiceStore);

interface Props {
  saveButtonName: string;
}

const props = defineProps<Props>();

const state = reactive({
  sourceServiceName: computed(() => sourceServiceInfo.value.name),
  description: computed(() => sourceServiceInfo.value.description),
});

const handleCheckSourceConnection = () => {
  sourceServiceStore.setWithSourceConnection();
};

const handleConfirm = () => {
  /**
   * TODO: 동기적으로 처리돼야 함
   * 1. register-source-group api
   * 2. 1번의 response가 오면 해당 source group의 sg name으로 (response값 이용)
   *    create-connection-info api 호출
   */
};

const sourceConnectionNames = ref<string>('');

watchEffect(
  () => {
    sourceConnectionNameList.value.forEach(
      (sourceConnectionName: string, idx: number) => {
        idx === sourceConnectionNameList.value.length - 1
          ? (sourceConnectionNames.value += sourceConnectionName)
          : (sourceConnectionNames.value += sourceConnectionName + ', ');
      },
    );
  },
  { flush: 'post' },
);

const handleUpdateValues = (value: string) => {
  state.sourceServiceName = value;
};
</script>

<template>
  <p-button-modal
    :visible="true"
    header-title="Add Source Service"
    size="md"
    :disabled="
      state.sourceServiceName === '' || state.sourceServiceName === undefined
    "
    @confirm="handleConfirm"
  >
    <template #body>
      <update-source-service
        :source-service-name="state.sourceServiceName"
        :description="state.description"
        @update:source-service-name="handleUpdateValues"
      />
    </template>
    <template #close-button>
      <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}</span>
    </template>
    <template #confirm-button>
      <span>{{ saveButtonName }}</span>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss"></style>
