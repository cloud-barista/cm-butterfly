<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { JsonEditor } from '@/features/sourceServices';
import { PI } from '@cloudforet-test/mirinae';
import { ref } from 'vue';

interface iProps {
  formData: string | undefined;
}

const props = defineProps<iProps>();
const emit = defineEmits(['update:is-converted']);

const convertedJson = ref<string | undefined>('');

const handleConvertJson = () => {
  // TODO: convert button action 미정
  convertedJson.value = props.formData;
  // isConverted.value = true;
  emit('update:is-converted');
};
</script>

<template>
  <div class="json-viewer-layout">
    <json-editor :form-data="formData" title="Meta (data)" :read-only="true" />
    <button class="convert-btn" @click="handleConvertJson">
      <p-i
        class="icon"
        name="ic_arrow-right"
        color="white"
        width="1rem"
        height="1rem"
      />
      {{ i18n.t('COMPONENT.BUTTON_MODAL.CONVERT') }}
    </button>
    <json-editor :form-data="convertedJson" title="Model" :read-only="false" />
  </div>
</template>

<style scoped lang="postcss">
.json-viewer-layout {
  @apply flex justify-center;
  .convert-btn {
    @apply flex justify-center items-center rounded-[4px] text-[#fff] bg-violet-400;
    font-size: 14px;
    padding: 0 12px;
  }
  .convert-btn:hover {
    @apply bg-violet-500;
  }
  .icon {
    @apply mr-[0.25rem];
  }
}
</style>
