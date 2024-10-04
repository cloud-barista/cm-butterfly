<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, watchEffect } from 'vue';
import { UpdateSourceService } from '@/features/sourceServices';
import EditSourceService from '@/features/sourceServices/updateSourceService/ui/EditSourceService.vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel.ts';
import { ISourceService } from '@/entities/sourceService/model/types';

interface iProps {
  selectedServiceId: string;
}

const props = defineProps<iProps>();

const { sourceServiceStore } = useSourceServiceDetailModel();

const emit = defineEmits(['update:is-service-modal-opened']);

const handleConfirm = () => {
  /**
   * TODO: 동기적으로 처리돼야 함
   * 1. register-source-group api
   * 2. 1번의 response가 오면 해당 source group의 sg name으로 (response값 이용)
   *    create-connection-info api 호출
   */
  emit('update:is-service-modal-opened', false);
};

const handleCancel = () => {
  emit('update:is-service-modal-opened', false);
};

const state = reactive<any>({
  name: '',
  description: '',
});

watchEffect(
  () => {
    const data: ISourceService | null = sourceServiceStore.getServiceById(
      props.selectedServiceId,
    );
    state.name = data?.name;
    state.description = data?.description;
  },
  { flush: 'post' },
);
</script>

<template>
  <p-button-modal
    :visible="true"
    header-title="Edit Source Service"
    size="md"
    :disabled="state.name === '' || state.name === undefined"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <template #body>
      <edit-source-service
        :is-edit="true"
        :source-service-name="state.name"
        :description="state.description"
      />
    </template>
    <template #close-button>
      <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}</span>
    </template>
    <template #confirm-button>
      <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.EDIT') }}</span>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss"></style>
