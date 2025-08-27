<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { collectJsonEditor } from '@/features/sourceServices';
import { PI, PSpinner } from '@cloudforet-test/mirinae';
import { ref, watch, computed } from 'vue';
import { AxiosResponse } from 'axios';
import { IUseAxiosWrapperReturnType } from '@/shared/libs';
import { useGetInfraInfoRefined } from '@/entities/sourceConnection/api';
import { showErrorMessage } from '@/shared/utils';

interface iProps {
  formData: any;
  promiseFunc: (payload?: any, config?: any) => Promise<AxiosResponse<any> | void>;
  convertedJSON: any;
  loading: boolean;
}

const props = defineProps<iProps>();
const emit = defineEmits(['update:is-converted']);

// formData와 convertedJSON을 computed로 최적화
const memoizedFormData = computed(() => props.formData);
const memoizedConvertedJSON = computed(() => props.convertedJSON);

function handleConvertJson() {
  props.promiseFunc().then(res => {
    emit('update:is-converted', res);
  });
}
</script>

<template>
  <div class="json-viewer-layout">
    <collect-json-editor
      :form-data="memoizedFormData"
      title="Meta (data)"
      :read-only="true"
      :schema="{ json: true, properties: {} }"
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
      :form-data="memoizedConvertedJSON"
      title="Model"
      :read-only="false"
      :schema="{ json: true, properties: {} }"
    />
  </div>
</template>

<style scoped lang="postcss">
.json-viewer-layout {
  @apply flex justify-center;
  width: 100%;
  min-width: 600px;
  max-width: 100%;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    min-width: 300px;
  }

  .convert-btn {
    @apply flex flex-col justify-center items-center rounded-[4px] text-[#fff] bg-violet-400;
    font-size: 14px;
    padding: 0 24px;
    position: relative;
    min-width: 80px;
    margin: 0 8px;
    
    @media (max-width: 768px) {
      margin: 8px 0;
      min-width: 120px;
    }

    .spinner {
      @apply pl-[8px];
      position: absolute;
      top: 450px;
      
      @media (max-width: 768px) {
        top: 60px;
      }
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
