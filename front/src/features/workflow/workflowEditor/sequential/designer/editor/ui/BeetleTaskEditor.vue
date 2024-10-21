<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import {
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  ref,
  toRef,
  watch,
} from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useTaskEditorModel } from '@/features/workflow/workflowEditor/sequential/designer/editor/model/beetleTaskEditorModel.ts';
import BAccordion from '@/shared/ui/Input/Accordian/BAccordion.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';

interface IProps {
  step: {
    id: string;
    name: string;
    properties: {
      isDeletable: boolean;
      model?: object;
    };
    sequence: [];
    type: string;
  };
}

const props = defineProps<IProps>();
const emit = defineEmits(['saveContext']);
const taskEditorModel = useTaskEditorModel();
console.log(props.step.properties.model);
watch(
  props,
  nv => {
    taskEditorModel.setFormContext(nv.step.properties.model ?? '');
    console.log(taskEditorModel.formContext.value);
  },
  { deep: true, immediate: true },
);
onMounted(() => {
  console.log('mount!#######################');
});
onBeforeUnmount(() => {
  console.log('t1@@@@@@@@@@@@@@@@@@@@@@@@@@');
});

onUnmounted(() => {
  console.log('t2@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  // emit('saveContext', taskEditorModel.convertFormModelToStepProperties());
});

onUpdated(() => {
  console.log('test@@@@@@@@@@@@@@@@@@@@@@@@');
});

function test() {
  console.log(taskEditorModel.convertFormModelToStepProperties());
}
</script>

<template>
  <div class="task-editor-form">
    <div
      v-for="(formContext, index) of taskEditorModel.formContext.value"
      :key="index"
      class="flex justify-between align-items-center"
    >
      <div
        class="entity-box w-full h-full"
        v-if="formContext.type === 'entity'"
      >
        <div class="subject-title border-bottom">
          {{ formContext.context.subject }}
          <p-button
            :style-type="'secondary'"
            icon-left="ic_plus"
            :size="'sm'"
            @click="taskEditorModel.addEntity(formContext.context.values)"
          >
            Add Entity
          </p-button>
        </div>
        <div
          class="field-group flex border-bottom"
          v-for="(entity, j) of formContext.context.values"
        >
          <div class="field-title-box" v-if="entity.type === 'input'">
            {{ entity.context.title }}
          </div>
          <div
            class="field-title-box"
            v-else-if="entity.type === 'keyValueInput'"
          >
            <p-text-input
              v-model="entity.context.title.value"
              :size="'md'"
              block
              :invalid="!entity.context.title.isValid"
              @blur="entity.context.title.onBlur"
            ></p-text-input>
          </div>
          <div class="field-content-box">
            <p-text-input
              v-model="entity.context.model.value"
              :size="'md'"
              block
              :invalid="!entity.context.model.isValid"
              @blur="entity.context.model.onBlur"
            ></p-text-input>
          </div>
        </div>
      </div>
      <div
        class="accordion-part w-full h-full"
        v-if="formContext.type === 'accordion'"
      >
        <div class="subject-title border-bottom">
          {{ formContext.context.subject }}
          <p-button
            :style-type="'secondary'"
            icon-left="ic_plus"
            :size="'sm'"
            @click="taskEditorModel.addArray(index)"
          >
            Add Object
          </p-button>
        </div>
        <BAccordion :items="formContext.context.values">
          <template #header="{ header, item, click, index: j, isOpen }">
            <div
              class="field-group flex justify-between align-items-center"
              :class="isOpen || 'border-bottom'"
            >
              <div class="field-title-box">
                <PIconButton
                  :class="isOpen && 'accordion-isOpen'"
                  :name="item.header.icon"
                  :size="'sm'"
                  @click="click"
                ></PIconButton>
                {{ j ?? '' }}
              </div>
            </div>
          </template>
          <template #content="{ content, item }">
            <div class="border-bottom">
              <div
                v-for="(element, index) in item.content"
                :key="index"
                class="flex justify-between align-items-center item-content"
              >
                <div
                  class="field-group flex w-full h-full"
                  v-if="element['type'] === 'input'"
                >
                  <div class="field-title-box">
                    {{ element['context'].title }}
                  </div>
                  <div class="field-content-box">
                    <p-text-input
                      v-model="element['context'].model.value"
                      :size="'md'"
                      block
                      :invalid="!element['context'].model.isValid"
                      @blur="element['context'].model.onBlur"
                    ></p-text-input>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </BAccordion>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.task-editor-form {
  .field-group {
    .field-title-box {
      display: flex;
      align-items: center;
      width: 200px;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
    }

    .field-content-box {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 310px;
      height: 44px;
      padding: 6px 16px 6px 16px;
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] flex justify-between items-center text-gray-500;
}

:deep(.accordion-item) {
  border-color: transparent;
}

:deep(.accordion-content) {
  padding-left: 0;
}

:deep(.accordion-header) {
  border-color: transparent;
}

.accordion-box {
  .item-content.field-group {
    border-color: transparent;

    .field-title-box {
      padding-left: 40px;
    }
  }

  .field-content-box {
    padding-left: 10px;
  }

  .item-content.field-group:last-child {
    border-color: inherit;
  }
}
</style>
