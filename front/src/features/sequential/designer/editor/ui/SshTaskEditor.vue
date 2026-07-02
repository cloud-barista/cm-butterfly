<template>
  <div class="custom-task-editor">
    <div class="section-header"><h4>SSH Task</h4></div>

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

    <div v-if="sshConnId" class="field">
      <label class="field-label">SSH Connection</label>
      <input class="text-input readonly" type="text" :value="sshConnId" readonly />
      <p class="hint">Task component에 고정된 SSH 연결입니다.</p>
    </div>

    <div class="field">
      <label class="field-label">Command<span class="req">*</span></label>
      <textarea
        class="text-area"
        rows="6"
        :value="model.command"
        placeholder="e.g. df -h"
        @input="onCommand"
      ></textarea>
      <p class="hint">원격 호스트에서 SSHOperator로 실행됩니다.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

export default defineComponent({
  name: 'SshTaskEditor',
  props: {
    step: { type: Object as () => Step, required: true },
  },
  emits: ['saveComponentName', 'saveContext'],
  setup(props, { emit }) {
    const name = ref(props.step.name);
    const model = reactive<{ command: string }>({
      command: (props.step.properties.model as any)?.command ?? '',
    });

    const sshConnId = computed(
      () => (props.step.properties as any)?.taskComponentData?.spec?.ssh_conn_id ?? '',
    );

    const onName = (e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      name.value = v;
      emit('saveComponentName', v);
    };

    const onCommand = (e: Event) => {
      model.command = (e.target as HTMLTextAreaElement).value;
      emit('saveContext', { ...model });
    };

    return { name, model, sshConnId, onName, onCommand };
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
.readonly {
  @apply bg-gray-100 text-gray-500;
}
.hint {
  @apply text-[11px] text-gray-400;
}
</style>
