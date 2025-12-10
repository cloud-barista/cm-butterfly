<template>
  <div class="task-component-editor">
    <div class="task-configuration-section">
      <div class="section-header">
        <h4>{{ headerTitle }}</h4>
      </div>

      <!-- Name Input -->
      <div class="component-name-section">
        <div class="field-label">
          <span class="label-text">{{ nameLabel }}</span>
          <span class="required-indicator">*</span>
        </div>
        <input
          type="text"
          v-model="containerName"
          @input="handleNameChange"
          class="component-name-input"
          :class="{ 'invalid': !isNameValid }"
          placeholder="Enter name"
        />
        <span v-if="!isNameValid" class="error-message">
          {{ errorMessage }}
        </span>
      </div>

      <!-- Description (Optional) -->
      <div class="params-section">
        <h5 class="params-title">Description (optional)</h5>
        <div class="params-content">
          <textarea
            v-model="description"
            @input="handleDescriptionChange"
            class="param-input"
            style="min-height: 80px; resize: vertical;"
            placeholder="설명을 입력하세요..."
          />
        </div>
      </div>

      <!-- Info Box -->
      <div :style="infoBoxStyle">
        <strong :style="{ color: iconColor }">{{ icon }} {{ infoTitle }}</strong>
        <p style="margin-top: 8px; color: #424242; font-size: 13px;">
          {{ infoDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue';

export default defineComponent({
  name: 'ContainerNameEditor',
  props: {
    step: {
      type: Object,
      required: true,
    },
    definition: {
      type: Object,
      required: true,
    },
  },
  emits: ['saveComponentName'],
  setup(props, { emit }) {
    const containerName = ref('');
    const description = ref('');
    const isNameValid = ref(true);
    const errorMessage = ref('');

    // 동적 설정 (TaskGroup vs launchPad)
    const isLaunchPad = computed(() => props.step.componentType === 'launchPad');

    const headerTitle = computed(() => 
      isLaunchPad.value ? 'Parrel Settings' : 'TaskGroup Settings'
    );

    const nameLabel = computed(() => 
      isLaunchPad.value ? 'Parrel Name' : 'TaskGroup Name'
    );

    const icon = computed(() => isLaunchPad.value ? '🚀' : '📦');

    const iconColor = computed(() => isLaunchPad.value ? '#2e7d32' : '#1565c0');

    const infoTitle = computed(() => 
      isLaunchPad.value ? 'Parallel Execution' : 'Sequential Execution'
    );

    const infoDescription = computed(() => 
      isLaunchPad.value 
        ? '이 Parrel 내의 task들은 동시에 병렬 실행됩니다.' 
        : '이 TaskGroup 내의 task들은 순차적으로 실행됩니다.'
    );

    const infoBoxStyle = computed(() => ({
      marginTop: '16px',
      padding: '12px',
      background: isLaunchPad.value ? '#e8f5e9' : '#e3f2fd',
      borderLeft: `4px solid ${isLaunchPad.value ? '#4caf50' : '#2196f3'}`,
      borderRadius: '4px',
    }));

    onMounted(() => {
      containerName.value = props.step.name || '';
      description.value = props.step.properties?.model?.description || '';
    });

    function handleNameChange() {
      const newName = containerName.value.trim();
      
      // 빈 이름 체크
      if (!newName) {
        isNameValid.value = false;
        errorMessage.value = '⚠️ Name cannot be empty';
        return;
      }
      
      // 중복 체크 (재귀적으로 전체 workflow 검사)
      function findDuplicateInSequence(sequence: any[], targetName: string, excludeId: string): boolean {
        for (const s of sequence) {
          if (s.id !== excludeId && s.name === targetName) {
            return true;
          }
          if (s.sequence && s.sequence.length > 0) {
            if (findDuplicateInSequence(s.sequence, targetName, excludeId)) {
              return true;
            }
          }
        }
        return false;
      }
      
      if (findDuplicateInSequence(props.definition.sequence, newName, props.step.id)) {
        isNameValid.value = false;
        errorMessage.value = `❌ Name "${newName}" already exists`;
        return;
      }
      
      isNameValid.value = true;
      errorMessage.value = '';
      emit('saveComponentName', newName);
    }

    function handleDescriptionChange() {
      if (!props.step.properties.model) {
        props.step.properties.model = {};
      }
      props.step.properties.model.description = description.value;
    }

    return {
      containerName,
      description,
      isNameValid,
      errorMessage,
      headerTitle,
      nameLabel,
      icon,
      iconColor,
      infoTitle,
      infoDescription,
      infoBoxStyle,
      handleNameChange,
      handleDescriptionChange,
    };
  },
});
</script>

<style scoped lang="postcss">
.task-component-editor {
  @apply p-4 bg-white;
}

.component-name-section {
  @apply mb-6;
}

.field-label {
  @apply flex items-center mb-2;
}

.label-text {
  @apply text-sm font-medium text-gray-700;
}

.required-indicator {
  @apply text-red-500 ml-1;
}

.component-name-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.component-name-input.invalid {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.error-message {
  @apply text-red-500 text-xs mt-1 block;
}

.task-configuration-section {
  @apply mb-6;
}

.params-section {
  @apply mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200;
}

.params-title {
  @apply text-base font-semibold text-gray-700 mb-3;
}

.params-content {
  @apply space-y-3;
}

.param-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.section-header {
  @apply mb-4 pb-3 border-b border-gray-200;
}

.section-header h4 {
  @apply text-lg font-semibold text-gray-800;
}
</style>

