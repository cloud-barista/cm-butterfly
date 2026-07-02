<template>
  <div class="custom-task-editor">
    <div class="section-header"><h4>HTTP (XCom) Task</h4></div>

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

    <div v-if="endpoint" class="field">
      <label class="field-label">Endpoint</label>
      <input class="text-input readonly" type="text" :value="`${method} ${endpoint}`" readonly />
      <p class="hint">Task component에 고정된 API 요청입니다.</p>
    </div>

    <div class="field">
      <label class="field-label">Source Task (request body)<span class="req">*</span></label>
      <input
        class="text-input"
        type="text"
        :value="model.request_body"
        placeholder="응답을 body로 사용할 이전 task 이름"
        @input="onSource"
      />
      <p class="hint">지정한 task의 XCom 결과가 이 요청의 body로 전달됩니다.</p>
    </div>

    <div class="field">
      <label class="field-label">Response Path</label>
      <input
        class="text-input"
        type="text"
        :value="model.response_path"
        placeholder="예: $.targetInfra (선택)"
        @input="onResponsePath"
      />
      <p class="hint">이전 task 응답에서 추출할 JSONPath (선택).</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

export default defineComponent({
  name: 'HttpXcomTaskEditor',
  props: {
    step: { type: Object as () => Step, required: true },
  },
  emits: ['saveComponentName', 'saveContext'],
  setup(props, { emit }) {
    const name = ref(props.step.name);
    const model = reactive<{ request_body: string; response_path: string }>({
      request_body: (props.step.properties.model as any)?.request_body ?? '',
      response_path: (props.step.properties.model as any)?.response_path ?? '',
    });

    const componentSpec = computed(
      () => (props.step.properties as any)?.taskComponentData?.spec ?? {},
    );
    const endpoint = computed(() => componentSpec.value.endpoint ?? '');
    const method = computed(() => componentSpec.value.method ?? '');

    const onName = (e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      name.value = v;
      emit('saveComponentName', v);
    };

    const emitModel = () => emit('saveContext', { ...model });

    const onSource = (e: Event) => {
      model.request_body = (e.target as HTMLInputElement).value;
      emitModel();
    };

    const onResponsePath = (e: Event) => {
      model.response_path = (e.target as HTMLInputElement).value;
      emitModel();
    };

    return { name, model, endpoint, method, onName, onSource, onResponsePath };
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
.text-input {
  @apply w-full border border-gray-300 rounded-[4px] p-[8px] text-[13px];
}
.readonly {
  @apply bg-gray-100 text-gray-500;
}
.hint {
  @apply text-[11px] text-gray-400;
}
</style>
