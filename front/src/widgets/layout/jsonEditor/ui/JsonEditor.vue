<script setup lang="ts">
import { PPaneLayout, PJsonSchemaForm } from '@cloudforet-test/mirinae';
import { computed, ref } from 'vue';

interface iProps {
  title: string;
  json: boolean;
  shemaProperties: any;
  formData: any;
  readOnly: boolean;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:form-data']);

const schema = computed(() => {
  return {
    json: props.json,
    properties: props.shemaProperties,
  };
});

const _formData = ref(props.formData);

function handleUpdateFormData(value: any) {
  emit('update:form-data', value);
}

// TODO: validation 추가 (key부분 변경 못하게 할 수 있는지 확인해보기)
</script>

<template>
  <p-pane-layout class="json-editor-layout">
    <p>{{ title }}</p>
    <p-json-schema-form
      class="p-json-schema-form"
      :read-only="readOnly"
      :form-data.sync="_formData"
      :schema="schema"
      @update:form-data="handleUpdateFormData"
    />
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.p-json-schema-form {
  @apply overflow-y-scroll;
  max-height: 900px;
}
</style>
