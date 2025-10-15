<template>
  <div class="task-component-editor-demo">
    <div class="demo-header">
      <h1>Task Component Editor Demo</h1>
      <p>vue-json-ui-editor를 사용한 Task Component 설정 에디터</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h2>Step 정보</h2>
        <div class="step-info">
          <p><strong>Step Name:</strong> {{ step.name }}</p>
          <p><strong>Step Type:</strong> {{ step.type }}</p>
          <p><strong>Component Type:</strong> {{ step.componentType }}</p>
        </div>
      </div>

      <div class="demo-section">
        <h2>Task Component Editor</h2>
        <task-component-editor 
          :step="step" 
          @save-component-name="handleSaveComponentName"
          @save-context="handleSaveContext"
          @save-fixed-model="handleSaveFixedModel"
        />
      </div>

      <div class="demo-section">
        <h2>저장된 데이터</h2>
        <div class="saved-data">
          <h3>Component Name:</h3>
          <p>{{ savedComponentName }}</p>
          
          <h3>Context:</h3>
          <pre>{{ JSON.stringify(savedContext, null, 2) }}</pre>
          
          <h3>Fixed Model:</h3>
          <pre>{{ JSON.stringify(savedFixedModel, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import TaskComponentEditor from '../ui/TaskComponentEditor.vue';
import type { Step } from '@/features/workflow/workflowEditor/model/types';

export default defineComponent({
  name: 'TaskComponentEditorDemo',
  components: {
    TaskComponentEditor
  },
  setup() {
    // 데모용 Step 데이터
    const step = ref<Step>({
      id: 'demo-task-1',
      name: 'Demo Task',
      type: 'task',
      componentType: 'task',
      properties: {
        model: {
          path_params: {
            nsId: 'ns-12345',
            projectId: 'project-67890'
          },
          query_params: {
            limit: '10',
            offset: '0'
          },
          body_params: {
            name: 'Sample Task',
            description: 'This is a sample task for demonstration'
          }
        },
        fixedModel: {
          task_component: 'sample_task_component',
          context: {
            environment: 'development',
            region: 'us-west-2'
          }
        }
      },
      context: {
        userId: 'user-123',
        sessionId: 'session-456'
      },
      metadata: {
        description: 'Demo task for testing TaskComponentEditor',
        version: '1.0.0',
        author: 'Developer',
        tags: ['demo', 'test', 'task']
      }
    });

    // 저장된 데이터
    const savedComponentName = ref('');
    const savedContext = ref({});
    const savedFixedModel = ref({});

    // 이벤트 핸들러들
    const handleSaveComponentName = (name: string) => {
      savedComponentName.value = name;
      console.log('Component name saved:', name);
    };

    const handleSaveContext = (context: any) => {
      savedContext.value = context;
      console.log('Context saved:', context);
    };

    const handleSaveFixedModel = (fixedModel: any) => {
      savedFixedModel.value = fixedModel;
      console.log('Fixed model saved:', fixedModel);
    };

    return {
      step,
      savedComponentName,
      savedContext,
      savedFixedModel,
      handleSaveComponentName,
      handleSaveContext,
      handleSaveFixedModel
    };
  }
});
</script>

<style scoped lang="postcss">
.task-component-editor-demo {
  @apply p-6 bg-gray-100 min-h-screen;
}

.demo-header {
  @apply mb-8 text-center;
}

.demo-header h1 {
  @apply text-3xl font-bold text-gray-800 mb-2;
}

.demo-header p {
  @apply text-gray-600;
}

.demo-content {
  @apply max-w-6xl mx-auto;
}

.demo-section {
  @apply mb-8 bg-white rounded-lg shadow-sm p-6;
}

.demo-section h2 {
  @apply text-xl font-semibold text-gray-800 mb-4;
}

.step-info {
  @apply space-y-2;
}

.step-info p {
  @apply text-gray-700;
}

.saved-data {
  @apply space-y-4;
}

.saved-data h3 {
  @apply text-lg font-medium text-gray-800;
}

.saved-data p {
  @apply text-gray-700;
}

.saved-data pre {
  @apply bg-gray-100 p-3 rounded-md text-sm text-gray-800 overflow-auto;
  max-height: 200px;
}
</style>
