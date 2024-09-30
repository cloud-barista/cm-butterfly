<script setup lang="ts">
import {
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PToggleButton,
  PDivider,
  PButton,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { watchEffect, ref, reactive, computed, watch } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';

const sourceConnectionStore = useSourceConnectionStore();
const sourceServiceStore = useSourceServiceStore();

const { sourceServiceInfo } = storeToRefs(sourceServiceStore);

interface iProps {
  sourceServiceName?: string;
  description?: string | null;
  isEdit: boolean;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:source-servie-info',
  'update:is-connection-modal-opened',
]);

const state = reactive({
  sourceServiceName: '',
  description: '' as string | null | undefined,
});

const handleCheckSourceConnection = () => {
  sourceConnectionStore.setWithSourceConnection(
    !sourceConnectionStore.withSourceConnection,
  );
};

const handleLink = () => {
  emit('update:is-connection-modal-opened', true);
};

const sourceConnectionNames = ref<string>('');

watchEffect(
  () => {
    sourceConnectionStore.editConnections.forEach(
      (sourceConnection, idx: number) => {
        idx === sourceConnectionStore.editConnections.length - 1
          ? (sourceConnectionNames.value += sourceConnection.name)
          : (sourceConnectionNames.value += sourceConnection.name + ', ');
      },
    );
  },
  { flush: 'post' },
);

watchEffect(
  () => {
    emit('update:source-servie-info', {
      sourceServiceName: state.sourceServiceName,
      description: state.description,
    });
  },
  { flush: 'post' },
);

watchEffect(() => {
  if (
    props.sourceServiceName ||
    (props.sourceServiceName && props.description)
  ) {
    state.sourceServiceName = props.sourceServiceName;
    state.description = props.description;
  }
});

const isAddDisabled = computed(
  () => sourceConnectionStore.withSourceConnection,
);
const isToggleDisabled = ref<boolean>(true);

watch(
  () => isToggleDisabled,
  () => {
    if (props.isEdit) {
      isToggleDisabled.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <p-pane-layout class="source-service-button-modal">
    <p-pane-layout class="layout">
      <p-field-group label="Source Service Name" required>
        <p-text-input
          v-model="state.sourceServiceName"
          placeholder="Source Service Name"
          :disabled="false"
        />
      </p-field-group>
      <p-field-group label="Description">
        <p-textarea
          v-if="state.description !== null"
          v-model="state.description"
          :disabled="false"
        />
      </p-field-group>
    </p-pane-layout>
    <p-pane-layout class="layout">
      <div class="toggle">
        <p-toggle-button
          :value="sourceConnectionStore.withSourceConnection"
          :disabled="!isToggleDisabled"
          @change-toggle="handleCheckSourceConnection"
        />
        <span>With Source Connection</span>
      </div>
      <p-divider />
      <p-button
        style-type="tertiary"
        :disabled="!isAddDisabled"
        @click="handleLink"
      >
        Go add Source Connection
      </p-button>
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
.link {
  font-weight: 400;
}
.link:hover {
  @apply text-blue-700;
  text-decoration: underline;
  cursor: pointer;
}
.source-service-button-modal {
  @apply flex flex-col gap-[1rem] bg-[#F7F7F7] p-[1rem] border-none;
  p {
    font-size: 0.875rem;
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
