<script setup lang="ts">
import { i18n } from '@/app/i18n';
import {
  PButtonModal,
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PTextarea,
  PToggleButton,
  PDivider,
  PLink,
} from '@cloudforet-test/mirinae';
import { ref } from 'vue';

interface Props {
  saveButtonName: string;
  sourceServiceInfo?: {
    sourceServiceName: string;
    id: string;
    description?: string;
  };
}

const props = defineProps<Props>();

// TODO: store값 임시로 (publishing 이후 수정 필요)
const withSourceConnection = ref(false);

const handleCheckSourceConnection = () => {
  withSourceConnection.value = !withSourceConnection.value;
};
</script>

<template>
  <p-button-modal
    :visible="true"
    header-title="Add Source Service"
    size="md"
    :disabled="false"
  >
    <template #body>
      <p-pane-layout class="source-service-button-modal">
        <p-pane-layout class="layout">
          <p-field-group label="Source Service Name" required>
            <p-text-input placeholder="Source Service Name" />
          </p-field-group>
          <p-field-group label="Description">
            <p-textarea />
          </p-field-group>
        </p-pane-layout>
        <p-pane-layout class="layout">
          <div class="toggle">
            <p-toggle-button
              :value="withSourceConnection"
              @change-toggle="handleCheckSourceConnection"
            />
            <span>With Source Connection</span>
          </div>
          <p-divider />
          <p-link
            text="Go add Source Connection"
            :to="{ name: 'sourceConnection' }"
            :highlight="withSourceConnection"
            :disabled="!withSourceConnection"
            action-icon="internal-link"
          />
          <p-field-group label="Source Connection" required>
            <p-text-input class="source-connection" disabled="true" />
          </p-field-group>
        </p-pane-layout>
      </p-pane-layout>
    </template>
    <template #close-button>
      <span>Cancel</span>
    </template>
    <template #confirm-button>
      <span>{{ saveButtonName }}</span>
    </template>
  </p-button-modal>
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
      .p-text-input {
      }
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
