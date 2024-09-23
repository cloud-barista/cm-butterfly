<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { JsonEditor } from '@/features/sourceServices';
import { PI } from '@cloudforet-test/mirinae';
import { reactive } from 'vue';

const state = reactive({
  schema: {
    type: 'object',
    properties: {
      os_version: {
        type: 'string',
        title: 'os_version',
      },
      os: {
        type: 'string',
        title: 'os',
      },
      email: {
        type: 'string',
        title: 'email',
      },
    },
  } as any,
  formData: {
    os_version: '1.0.0',
    os: 'windows',
    email: 'test@test.com',
  } as any,
});

const handleConvertJson = () => {
  console.log('here');
};
</script>

<template>
  <div class="json-viewer-layout">
    <json-editor :schema="state.schema" :form-data="state.formData" />
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
    <json-editor :schema="state.schema" :form-data="{}" />
  </div>
</template>

<style scoped lang="postcss">
.json-viewer-layout {
  @apply flex justify-center;
  min-width: 480px;
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
