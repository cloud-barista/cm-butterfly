<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, ref, watch, watchEffect } from 'vue';
import EditSourceService from '../../updateSourceService/ui/EditSourceService.vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel.ts';
import { ISourceService } from '@/entities/sourceService/model/types.ts';
import { useUpdateSourceGroup } from '@/entities/sourceService/api';
import { showErrorMessage } from '@/shared/utils';

const updateSourceGroup = useUpdateSourceGroup(null, {
  name: '',
  description: '',
});

interface iProps {
  selectedServiceId: string;
}

const props = defineProps<iProps>();

const { sourceServiceStore } = useSourceServiceDetailModel();

const state = reactive<any>({
  name: '',
  description: '',
});

const emit = defineEmits(['update:is-service-modal-opened', 'update:trigger']);

const handleConfirm = () => {
  updateSourceGroup
    .execute({
      pathParams: { sgId: props.selectedServiceId },
      request: {
        name: state.name,
        description: state.description,
      },
    })
    .then(r => {
      emit('update:trigger');
      emit('update:is-service-modal-opened', false);
    })
    .catch(e => {
      console.log(e);
      showErrorMessage('error', 'Edit Failed');
    });
};

const handleCancel = () => {
  emit('update:is-service-modal-opened', false);
};

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

function handleSourceServiceInfo(value: {
  sourceServiceName: string;
  description: string;
}) {
  state.name = value.sourceServiceName;
  state.description = value.description;
}
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
        @update:source-servie-info="handleSourceServiceInfo"
        @update:is-connection-modal-opened="
          emit('update:is-service-modal-opened', false)
        "
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
