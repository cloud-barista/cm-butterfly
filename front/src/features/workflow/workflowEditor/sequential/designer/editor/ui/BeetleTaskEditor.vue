<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import Vue, {
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  ref,
  toRef,
  UnwrapRef,
  watch,
} from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useTaskEditorModel } from '@/features/workflow/workflowEditor/sequential/designer/editor/model/beetleTaskEditorModel.ts';
import BAccordion from '@/shared/ui/Input/Accordian/BAccordion.vue';
import SequentialShortCut from '@/features/workflow/workflowEditor/sequential/designer/shortcut/ui/SequentialShortCut.vue';

export interface fixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

interface IProps {
  step: {
    id: string;
    name: string;
    properties: {
      isDeletable: boolean;
      model?: object;
      originalData: object;
      fixedModel?: fixedModel;
    };
    sequence: [];
    type: string;
  };
}

const props = defineProps<IProps>();
const emit = defineEmits(['saveContext', 'saveFixedModel']);
const taskEditorModel = useTaskEditorModel();
console.log(props);
const shortCutModel = ref({
  open: false,
  xPos: 0,
  yPos: 0,
  delete: {
    label: 'Delete',
    callback: function () {},
  },
});
const editorFormElement = ref(null);
let shortCut;

onMounted(() => {
  taskEditorModel.setFormContext(props.step.properties.model ?? '');
  if (props.step.properties.fixedModel) {
    taskEditorModel.setParamsContext(props.step.properties.fixedModel);
  }
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  taskEditorModel.formContext,
  nv => {
    emit('saveContext', taskEditorModel.convertFormModelToStepProperties());
  },
  { deep: true },
);
watch(
  taskEditorModel.paramsContext,
  () => {
    emit(
      'saveFixedModel',
      taskEditorModel.convertParamsModelToStepProperties(),
    );
  },
  { deep: true },
);

function openShortCut(e) {
  shortCutModel.value.open = true;
  shortCutModel.value.xPos = e.offsetX + e.target.offsetLeft;
  shortCutModel.value.yPos = e.offsetY + e.target.offsetTop;
}

function closeShortCut() {
  shortCutModel.value.open = false;
}

function deleteEntity(e, index) {
  e.preventDefault();
  shortCutModel.value.delete.callback = () =>
    taskEditorModel.deleteEntity(index);
  openShortCut(e);
}

function deleteArrayElement(
  e: MouseEvent,
  targetArr: Array<any>,
  targetIndex: number,
) {
  e.preventDefault();
  shortCutModel.value.delete.callback = () =>
    taskEditorModel.deleteArrayElement(targetArr, targetIndex);
  openShortCut(e);
}

function handleClickOutside(event: MouseEvent) {
  const sequentialShortCutElement = document.querySelector(
    '.sequential-shortcut',
  );
  if (
    sequentialShortCutElement &&
    !sequentialShortCutElement.contains(event.target as Node)
  ) {
    closeShortCut();
  }
}
</script>

<template>
  <div
    class="task-editor-form"
    ref="editorFormElement"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >
    <div
      v-for="(currentParams, index) of taskEditorModel.paramsContext.value"
      :key="index"
    >
      <div class="params-box w-full h-full">
        <div v-if="currentParams.type === 'params'">
          <div v-if="currentParams.context.values.length > 0">
            <div class="subject-title border-bottom">
              {{ currentParams.context.subject }}
            </div>
            <div
              v-for="(entity, j) of currentParams.context.values"
              :key="j"
              class="field-group flex border-bottom"
            >
              <div class="field-title-box" v-if="entity.type === 'input'">
                {{ entity.context.title }}
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
        </div>
      </div>
    </div>
    <div
      v-for="(currentContext, index) of taskEditorModel.formContext.value"
      :key="index"
      class="flex justify-between align-items-center"
    >
      <div
        v-if="currentContext.type === 'entity'"
        class="entity-box w-full h-full"
      >
        <div class="subject-title border-bottom">
          {{ currentContext.context.subject }}
          <p-button
            :style-type="'secondary'"
            icon-left="ic_plus"
            :size="'sm'"
            @click="taskEditorModel.addEntity(currentContext.context.values)"
          >
            Add Entity
          </p-button>
        </div>
        <div
          class="field-group flex border-bottom"
          v-for="(entity, j) of currentContext.context.values"
          :key="j"
          @click.right="e => deleteEntity(e, j)"
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
              @blur="taskEditorModel.entityKeyValidation(entity.context.title)"
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
        v-if="currentContext.type === 'accordion'"
        class="accordion-part w-full h-full"
      >
        <div class="subject-title border-bottom">
          {{ currentContext.context.subject }}
          <p-button
            :style-type="'secondary'"
            icon-left="ic_plus"
            :size="'sm'"
            @click="taskEditorModel.addArray(index)"
          >
            Add Object
          </p-button>
        </div>
        <BAccordion :items="currentContext.context.values">
          <template #header="{ header, item, click, index: j, isOpen }">
            <div
              class="field-group flex justify-between align-items-center"
              :class="isOpen || 'border-bottom'"
              @click.right="
                e => deleteArrayElement(e, currentContext.context.values, j)
              "
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
    <SequentialShortCut
      :open="shortCutModel.open"
      :x-pos="shortCutModel.xPos"
      :y-pos="shortCutModel.yPos"
      :items="[
        {
          label: shortCutModel.delete.label,
          callback: shortCutModel.delete.callback,
        },
      ]"
      @close="closeShortCut"
    ></SequentialShortCut>
  </div>
</template>

<style scoped lang="postcss">
.task-editor-form {
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
  width: 100%;
  height: calc(100% - 20px);

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
