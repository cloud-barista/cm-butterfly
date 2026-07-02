<template>
  <div class="custom-task-editor">
    <div class="section-header"><h4>Bash Task</h4></div>

    <div class="field">
      <label class="field-label">Task Name</label>
      <input
        class="text-input"
        type="text"
        :value="name"
        placeholder="Enter task name"
        @input="onName"
      />
    </div>

    <div class="field">
      <label class="field-label">
        Bash Command<span class="req">*</span>
      </label>
      <textarea
        class="text-area"
        rows="6"
        :value="model.bash_command"
        placeholder="e.g. echo 'hello world'"
        @input="onCommand"
      ></textarea>
      <p class="hint">BashOperator로 실행될 셸 명령입니다.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

export default defineComponent({
  name: 'BashTaskEditor',
  props: {
    step: { type: Object as () => Step, required: true },
  },
  emits: ['saveComponentName', 'saveContext'],
  setup(props, { emit }) {
    const name = ref(props.step.name);
    const model = reactive<{ bash_command: string }>({
      bash_command: (props.step.properties.model as any)?.bash_command ?? '',
    });

    const onName = (e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      name.value = v;
      emit('saveComponentName', v);
    };

    const onCommand = (e: Event) => {
      model.bash_command = (e.target as HTMLTextAreaElement).value;
      emit('saveContext', { ...model });
    };

    return { name, model, onName, onCommand };
  },
});
</script>

<style scoped lang="postcss">
.custom-task-editor {
  @apply p-[16px] flex flex-col gap-[16px];
}
.section-header h4 {
  @apply text-[16px] font-semibold;
}
.field {
  @apply flex flex-col gap-[4px];
}
.field-label {
  @apply text-[13px] font-medium text-gray-700;
}
.req {
  @apply text-red-500 ml-[2px];
}
.text-input,
.text-area {
  @apply w-full border border-gray-300 rounded-[4px] p-[8px] text-[13px];
}
.text-area {
  font-family: monospace;
}
.hint {
  @apply text-[11px] text-gray-400;
}
</style>
