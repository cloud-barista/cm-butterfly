<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, ref, watchEffect, computed, onMounted, watch } from 'vue';
import { SourceConnection, useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { UpdateSourceService } from '@/features/sourceServices';
import { useRegisterSourceGroup } from '@/entities/temp/api';
import { TranslateResult } from 'vue-i18n';
import { showSuccessMessage, showErrorMessage } from '@/shared/utils';

const sourceServiceStore = useSourceServiceStore();

const {
  sourceConnectionNameList,
  sourceServiceInfo,
  sourceConnectionInfoList,
} = storeToRefs(sourceServiceStore);

interface Props {
  saveButtonName: string | TranslateResult;
  trigger?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits([
  'update:isModalOpened',
  'update:is-connection-modal-opened',
  'update:trigger',
]);

const registerSourceGroup = useRegisterSourceGroup<{ request: any }, any>(null);

const state = reactive({
  sourceServiceName: computed(() => sourceServiceInfo.value.name),
  description: computed(() => sourceServiceInfo.value.description),
});

const handleCheckSourceConnection = () => {
  sourceServiceStore.setWithSourceConnection();
};

const handleConfirm = async () => {
  sourceConnectionInfoList.value.map((sourceConnection: SourceConnection) => {
    sourceConnection.ssh_port = Number(sourceConnection.ssh_port);
  });

  try {
    const { data } = await registerSourceGroup.execute({
      request: {
        name: sourceServiceInfo.value.name,
        description: sourceServiceInfo.value.description,
        connections: sourceConnectionInfoList.value,
      },
    });

    if (data) {
      showSuccessMessage('success', 'Register Success');
      sourceConnectionInfoList.value = [];
      sourceConnectionNames.value = '';
      sourceServiceInfo.value = {
        name: '',
        description: '',
      };

      emit('update:trigger');
      emit('update:isModalOpened', false);
    }
  } catch (err: any) {
    if (err?.error.value.code === 'ERR_BAD_RESPONSE') {
      showErrorMessage('failed', 'already existed source group');
      console.log(err);
    }
  }
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

// const handleUpdateValues = (value: any) => {
//   state.sourceServiceName = value.name;
//   state.description = value.description;
// };

const handleCancel = () => {
  emit('update:isModalOpened', false);
};

const handleConnectionModal = (value: boolean) => {
  emit('update:is-connection-modal-opened', value);
};

// watch(
//   () => props.trigger,
//   nv => {
//     if (nv) {
//       console.log(nv);
//       emit('update:trigger');
//     }
//   },
// );
</script>

<template>
  <div>
    <p-button-modal
      :visible="true"
      header-title="Add Source Service"
      size="md"
      :disabled="
        state.sourceServiceName === '' || state.sourceServiceName === undefined
      "
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="handleCancel"
    >
      <template #body>
        <update-source-service
          @update:is-connection-modal-opened="handleConnectionModal"
        />
      </template>
      <template #close-button>
        <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}</span>
      </template>
      <template #confirm-button>
        <span>{{ saveButtonName }}</span>
      </template>
    </p-button-modal>
  </div>
</template>

<style scoped lang="postcss"></style>
