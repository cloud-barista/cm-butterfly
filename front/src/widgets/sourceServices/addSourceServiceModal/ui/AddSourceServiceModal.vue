<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, ref, watchEffect, computed, onMounted } from 'vue';
import { SourceConnection, useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { UpdateSourceService } from '@/features/sourceServices';
import { useRegisterSourceGroup } from '@/entities/temp/api';
import { TranslateResult } from 'vue-i18n';

const sourceServiceStore = useSourceServiceStore();

const {
  sourceConnectionNameList,
  sourceServiceInfo,
  sourceConnectionInfoList,
} = storeToRefs(sourceServiceStore);

interface Props {
  saveButtonName: string | TranslateResult;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:isModalOpened']);

const registerSourceGroup = useRegisterSourceGroup<{ request: any }, any>(null);

// TODO: merge 이후 add 버튼에 추가.
const tempBtn = async () => {
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
      alert('Source Group이 성공적으로 추가되었습니다.');
      sourceConnectionInfoList.value = [];
      sourceConnectionNames.value = '';
      sourceServiceInfo.value = {
        name: '',
        description: '',
      };
    }
  } catch (err: any) {
    if (err?.error.value.code === 'ERR_BAD_RESPONSE') {
      alert('이미 존재하는 Source Group입니다.');
      console.log(err);
    }
  }
};

const state = reactive({
  sourceServiceName: computed(() => sourceServiceInfo.value.name),
  description: computed(() => sourceServiceInfo.value.description),
});

const handleCheckSourceConnection = () => {
  sourceServiceStore.setWithSourceConnection();
};

const handleConfirm = () => {
  /**
   * TODO: 새롭게 source service를 생성하는 경우
   *
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

// const handleUpdateValues = (value: any) => {
//   state.sourceServiceName = value.name;
//   state.description = value.description;
// };

const handleCancel = () => {
  emit('update:isModalOpened', false);
};

const isOpenedModal = ref<boolean>(false);
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
    >
      <template #body>
        <update-source-service />
        <!-- :source-service-name="state.sourceServiceName"
        :description="state.description" -->
        <!-- @update:source-service-name="handleUpdateValues" -->
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
