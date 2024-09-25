<script setup lang="ts">
import {
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PToggleButton,
  PDivider,
  PLink,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { watchEffect, ref } from 'vue';

const sourceServiceStore = useSourceServiceStore();

const { withSourceConnection, sourceConnectionNameList, sourceServiceInfo } =
  storeToRefs(sourceServiceStore);

// interface iProps {
//   sourceServiceName: string;
//   description: string;
// }

// const props = defineProps<iProps>();

const emit = defineEmits(['update:sourceServiceName']);

// const state = reactive({
//   sourceServiceName: sourceServiceInfo.value.name,
//   description: sourceServiceInfo.value.description,
// });

const handleCheckSourceConnection = () => {
  sourceServiceStore.setWithSourceConnection();
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

watchEffect(
  () => {
    emit('update:sourceServiceName', sourceServiceInfo.value);
  },
  { flush: 'post' },
);
</script>

<template>
  <p-pane-layout class="source-service-button-modal">
    <p-pane-layout class="layout">
      <p-field-group label="Source Service Name" required>
        <p-text-input
          v-model="sourceServiceInfo.name"
          placeholder="Source Service Name"
          :disabled="false"
        />
      </p-field-group>
      <p-field-group label="Description">
        <p-textarea v-model="sourceServiceInfo.description" :disabled="false" />
      </p-field-group>
    </p-pane-layout>
    <p-pane-layout class="layout">
      <div class="toggle">
        <p-toggle-button
          v-model="withSourceConnection"
          @change-toggle="handleCheckSourceConnection"
        />
        <span>With Source Connection</span>
      </div>
      <p-divider />
      <p-link
        text="Go add Source Connection"
        :to="{ name: 'sourceConnection' }"
        action-icon="internal-link"
        :highlight="withSourceConnection"
        :disabled="!withSourceConnection"
      />
      <p-field-group label="Source Connection" required>
        <p-text-input
          v-model="sourceConnectionNames"
          class="source-connection"
          :disabled="true"
        />
      </p-field-group>
    </p-pane-layout>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.source-service-button-modal {
  @apply flex flex-col gap-[1rem] bg-[#F7F7F7] p-[1rem] border-none;
  p {
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    .optional {
      margin-left: 0.25rem;
      color: #898995;
      font-size: 0.75rem;
      font-weight: 400;
    }
  }
  .layout {
    @apply flex flex-col gap-[0.75rem] bg-[#FFF] rounded-[0.375rem] p-[0.75rem] border-none;
    .input-container {
      @apply bg-[#F7F7F7];
    }
    .p-field-group {
      margin-bottom: 0;
    }
    .toggle {
      /* @apply p-[0.75rem]; */
      @apply flex gap-[0.5rem];
      span {
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.0938rem;
      }
    }
  }
}
:deep(.p-link) {
  font-size: 14px;
  /* font-weight: 400; */
}
:deep(.p-text-input) {
  width: 100%;
}
</style>
