<script setup lang="ts">
import { i18n } from '@/app/i18n';
// import { collect } from '@/features/sourceServices';
import { collectJsonEditor } from '@/features/sourceServices';
import { PI } from '@cloudforet-test/mirinae';
import { ref, watchEffect } from 'vue';

interface iProps {
  formData: string | undefined;
  schema: {
    json: boolean;
    properties: object;
  };
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
    <collect-json-editor
      :form-data="formData"
      title="Meta (data)"
      :read-only="true"
      :schema="schema"
    />
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
    <collect-json-editor
      :form-data="convertedJson"
      title="Model"
      :read-only="false"
      :schema="schema"
    />
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
