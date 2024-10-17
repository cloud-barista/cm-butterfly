<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted, reactive, ref, toRef, watch } from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useTaskEditorModel } from '@/features/workflow/temp/workflowEditor/sequential/designer/editor/model/beetleTaskEditorModel.ts';
import BAccordion from '@/shared/ui/Input/Accordian/BAccordion.vue';

interface IProps {
  id: ref<string>;
}

const props = defineProps<IProps>();
const emit = defineEmits(['button-click']);

const stepEditorProviderModel = useTaskEditorModel();

watch(props, nv => {});

onMounted(() => {});
</script>

<template>
  <div class="task-editor-form">
    <div class="header flex gap-3 mt-[32px] h-[40px] justify-end pr-[16px]">
      <p-button :style-type="'secondary'" icon-left="ic_plus" :size="'sm'">
        Add Entity
      </p-button>
      <p-button
        :style-type="'secondary'"
        icon-left="ic_plus"
        :size="'sm'"
        @click="stepEditorProviderModel.addAccordionSlot"
      >
        Add VM
      </p-button>
    </div>
    <div
      v-for="(entity, index) in stepEditorProviderModel.formValues.entity"
      :key="index"
      class="field-group flex justify-between align-items-center"
    >
      <div class="field-title-box">
        {{ entity.title }}
      </div>
      <div class="field-content-box">
        <p-text-input
          v-model="entity.model.value"
          :size="'md'"
          block
          :invalid="!entity.model.isValid"
          @blur="entity.model.onBlur"
        ></p-text-input>
      </div>
    </div>

    <section class="vm-list">
      <BAccordion :items="stepEditorProviderModel.formValues.accordions">
        <template #header="{ header, item, click }">
          <div class="field-group flex justify-between align-items-center">
            <div class="field-title-box">
              <PIconButton
                :name="item.header.icon"
                :size="'sm'"
                @click="click"
              ></PIconButton>
              {{ item.header.title }}
            </div>
            <div class="field-content-box">
              <p-text-input
                v-model="item.content.vms.header.vmName.model.value"
                :size="'md'"
                :invalid="!item.content.vms.header.vmName.model.isValid"
                block
                @blur="item.content.vms.header.vmName.model.onBlur"
              ></p-text-input>
            </div>
          </div>
        </template>
        <template #content="{ content, item }">
          <div
            v-for="(key, index) in item.content.vms.body"
            :key="index"
            class="field-group flex justify-between align-items-center item-content"
          >
            <div class="field-title-box">
              {{ key.title }}
            </div>
            <div class="field-content-box">
              <template v-if="key.type === 'text'">
                <p-text-input
                  v-model="key['model'].value"
                  :size="'md'"
                  block
                  :invalid="!key['model'].isValid"
                  @blur="key['model'].onBlur"
                ></p-text-input>
              </template>
            </div>
          </div>
        </template>
      </BAccordion>
    </section>
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

    border-bottom: 1px solid;
    @apply border-gray-200;

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
