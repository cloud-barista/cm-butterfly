<template>
  <div class="custom-task-editor">
    <div class="section-header"><h4>Trigger Workflow Task</h4></div>

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

    <div v-if="triggerDagId" class="field">
      <label class="field-label">Trigger Workflow (DAG)</label>
      <input class="text-input readonly" type="text" :value="triggerDagId" readonly />
      <p class="hint">Task component에 고정된 트리거 대상 워크플로우입니다.</p>
    </div>

    <div class="field">
      <label class="field-label">Conf (JSON)</label>
      <textarea
        class="text-area"
        rows="8"
        :value="confText"
        placeholder='{ "key": "value" }'
        @input="onConf"
      ></textarea>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-else class="hint">트리거되는 워크플로우로 전달할 conf 객체 (선택).</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

export default defineComponent({
  name: 'TriggerWorkflowTaskEditor',
  props: {
    step: { type: Object as () => Step, required: true },
  },
  emits: ['saveComponentName', 'saveContext'],
  setup(props, { emit }) {
    const name = ref(props.step.name);
    const initialConf = (props.step.properties.model as any)?.conf ?? {};
    const conf = ref<Record<string, any>>(initialConf);
    const confText = ref(JSON.stringify(initialConf, null, 2));
    const error = ref<string | null>(null);

    const triggerDagId = computed(
      () =>
        (props.step.properties as any)?.taskComponentData?.spec?.trigger_dag_id ??
        '',
    );

    const onName = (e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      name.value = v;
      emit('saveComponentName', v);
    };

    const onConf = (e: Event) => {
      const raw = (e.target as HTMLTextAreaElement).value;
      confText.value = raw;
      const trimmed = raw.trim();
      if (trimmed === '') {
        error.value = null;
        conf.value = {};
        emit('saveContext', { conf: {} });
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        error.value = null;
        conf.value = parsed;
        emit('saveContext', { conf: parsed });
      } catch (err: any) {
        error.value = 'Invalid JSON: ' + (err?.message ?? '');
      }
    };

    return { name, confText, error, triggerDagId, onName, onConf };
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
.error {
  @apply text-[11px] text-red-500;
}
</style>
