<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { ref, computed, watch } from 'vue';
import { decodeBase64, encodeBase64 } from '@/shared/utils/base64';

interface iProps {
  title: string;
  name: string;
  json: object | null | undefined | any;
  schema: {
    json: boolean;
    properties: object;
  };
  readOnly: boolean;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:close-modal',
  'update:api',
  'update:trigger',
]);

// Decode base64 content for cicada_task_script tasks
// cicada_task_script 태스크의 content 필드를 base64로 디코딩
const decodedJson = computed(() => {
  if (!props.json || typeof props.json !== 'object') {
    return props.json;
  }

  const jsonCopy = JSON.parse(JSON.stringify(props.json));
  
  // Process task_groups
  if (jsonCopy.task_groups && Array.isArray(jsonCopy.task_groups)) {
    processTaskGroups(jsonCopy.task_groups);
  }
  
  return jsonCopy;
});

function processTaskGroups(taskGroups: any[]) {
  taskGroups.forEach((taskGroup: any) => {
    // Process tasks in the task group
    if (taskGroup.tasks && Array.isArray(taskGroup.tasks)) {
      taskGroup.tasks.forEach((task: any) => {
        if (task.task_component === 'cicada_task_script' && task.request_body) {
          try {
            const requestBody = JSON.parse(task.request_body);
            if (requestBody.content) {
              console.log('🔓 Decoding content in JSON Viewer for task:', task.name);
              requestBody.content = decodeBase64(requestBody.content);
              task.request_body = JSON.stringify(requestBody);
            }
          } catch (e) {
            console.error('Error decoding task request_body:', e);
          }
        }
      });
    }
    
    // Recursively process nested task_groups
    if (taskGroup.task_groups && Array.isArray(taskGroup.task_groups)) {
      processTaskGroups(taskGroup.task_groups);
    }
  });
}

const updatedData = ref(decodedJson.value);
const isSaveAble = ref<boolean>(true);

// Watch for changes in decodedJson
watch(decodedJson, (newVal) => {
  updatedData.value = newVal;
}, { immediate: true });

function handleModal() {
  emit('update:close-modal', false);
}

function handleSchemaUpdate(data: any) {
  updatedData.value = data;
}

async function handleSave() {
  if (updatedData.value !== null) {
    // Re-encode content fields before saving
    // 저장 전에 content 필드를 다시 인코딩
    const dataToSave = JSON.parse(JSON.stringify(updatedData.value));
    
    if (dataToSave.task_groups && Array.isArray(dataToSave.task_groups)) {
      encodeTaskGroups(dataToSave.task_groups);
    }
    
    emit('update:close-modal', false);
    emit('update:api', dataToSave);
  }
}

function encodeTaskGroups(taskGroups: any[]) {
  taskGroups.forEach((taskGroup: any) => {
    // Process tasks in the task group
    if (taskGroup.tasks && Array.isArray(taskGroup.tasks)) {
      taskGroup.tasks.forEach((task: any) => {
        if (task.task_component === 'cicada_task_script' && task.request_body) {
          try {
            const requestBody = JSON.parse(task.request_body);
            if (requestBody.content) {
              console.log('🔐 Encoding content in JSON Viewer for task:', task.name);
              requestBody.content = encodeBase64(requestBody.content);
              task.request_body = JSON.stringify(requestBody);
            }
          } catch (e) {
            console.error('Error encoding task request_body:', e);
          }
        }
      });
    }
    
    // Recursively process nested task_groups
    if (taskGroup.task_groups && Array.isArray(taskGroup.task_groups)) {
      encodeTaskGroups(taskGroup.task_groups);
    }
  });
}
</script>

<template>
  <create-form
    class="page-modal-layout"
    :badge-title="name"
    :title="title"
    :need-widget-layout="true"
    first-title="JSON Viewer"
    @update:modal-state="handleModal"
  >
    <template #add-info>
      <json-editor
        title="Target Model"
        :read-only="readOnly"
        :json="schema.json"
        :shema-properties="schema.properties"
        :form-data="updatedData"
        @update:form-data="handleSchemaUpdate"
        @disable:save-button="isSaveAble = false"
      />
    </template>
    <template v-if="!readOnly" #buttons>
      <p-button
        style-type="tertiary"
        @click="emit('update:close-modal', false)"
      >
        Cancel
      </p-button>
      <p-button @click="handleSave">Save</p-button>
    </template>
  </create-form>
</template>
