<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { collectJsonEditor } from '@/features/sourceServices';
import { PI, PSpinner } from '@cloudforet-test/mirinae';
import { AxiosResponse } from 'axios';

interface iProps {
  formData: string | undefined;
  promiseFunc: (payload?: any, config?: any) => Promise<AxiosResponse<any>>;
  convertedJSON: string | undefined;
  loading: boolean;
}

const props = defineProps<iProps>();
const emit = defineEmits(['update:is-converted']);

function handleConvertJson() {
  props.promiseFunc().then(res => {
    emit('update:is-converted', res);
  });
}
</script>

<template>
  <div class="json-viewer-layout">
    <collect-json-editor
      :form-data="formData"
      title="Meta (data)"
      :read-only="true"
    />
    <button class="convert-btn" @click="handleConvertJson">
      <div class="flex flex-row">
        <p-i
          class="icon"
          name="ic_arrow-right"
          color="white"
          width="1rem"
          height="1rem"
        />
        <p>{{ i18n.t('COMPONENT.BUTTON_MODAL.CONVERT') }}</p>
      </div>
      <p-spinner v-if="loading" class="spinner" size="md" />
    </button>
    <collect-json-editor
      :form-data="convertedJSON"
      title="Model"
      :read-only="false"
    />
  </div>
</template>

<style scoped lang="postcss">
.json-viewer-layout {
  @apply flex justify-center;

  .convert-btn {
    @apply flex flex-col justify-center items-center rounded-[4px] text-[#fff] bg-violet-400;
    font-size: 14px;
    padding: 0 24px;
    position: relative;

    .spinner {
      @apply pl-[8px];
      position: absolute;
      top: 450px;
    }

    .no-spinner {
      @apply w-[8px] h-[8px];
      position: absolute;
    }
  }

  .convert-btn:hover {
    @apply bg-violet-500;
  }

  .convert-btn:focus {
    @apply bg-violet-400;
  }

  .disable-btn {
    @apply bg-gray-300;
    cursor: not-allowed;
  }

  .icon {
    @apply mt-[2px] mr-[0.25rem];
  }
}
</style>
