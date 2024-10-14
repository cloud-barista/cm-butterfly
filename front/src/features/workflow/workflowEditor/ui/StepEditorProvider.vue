<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted, reactive, ref, toRef, watch } from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useStepEditorProviderModel } from '@/features/workflow/workflowEditor/model/stepEditorProviderModel.ts';

interface IProps {
  id: ref<string>;
}

const props = defineProps<IProps>();
const emit = defineEmits(['button-click']);

const stepEditorProviderModel = useStepEditorProviderModel();
watch(props, nv => {
  console.log('update!');
  console.log(nv);
  // props.id.value = nv;
});

onMounted(() => {
  console.log(props);
  console.log('Mount!');
});
</script>

<template>
  <div class="task-editor-form">
    <div class="header">
      test
      <p-button
        @click="stepEditorProviderModel.addAccordionSlot"
        icon-left="ic_plus"
        :style-type="'secondary'"
      >
        Add Entity
      </p-button>
    </div>
    <div
      class="field-group flex justify-between align-items-center"
      v-for="entity in stepEditorProviderModel.formValues.entity"
    >
      <div class="field-title-box">
        {{ entity.title }}
      </div>
      <div class="field-content-box">
        <p-text-input
          :size="'md'"
          block
          v-model="entity.model.value"
          :invalid="!entity.model.isValid"
          @blur="entity.model.onBlur"
        ></p-text-input>
      </div>
    </div>

    <section class="vm-list">
      <div class="header">
        test
        <button @click="stepEditorProviderModel.addAccordionSlot">tests</button>
      </div>

      <div class="accordion" role="tablist">
        <b-card
          no-body
          v-for="(accordion, index) in stepEditorProviderModel.formValues
            .accordions"
          :key="index"
        >
          <b-card-header header-tag="header" role="tab">
            <div
              class="field-group flex justify-between align-items-center"
              v-for="vms in accordion.value"
            >
              <div class="field-title-box">
                <PIconButton
                  v-b-toggle="'accordion-' + (index + 1)"
                  :name="accordion.icon"
                  :size="'sm'"
                ></PIconButton>
                {{ vms.header.vmName.title }}
              </div>
              <div class="field-content-box">
                <p-text-input
                  :size="'md'"
                  block
                  v-model="vms.header.vmName.model.value"
                  :invalid="!vms.header.vmName.model.isValid"
                  @blur="vms.header.vmName.model.onBlur"
                ></p-text-input>
              </div>
            </div>
          </b-card-header>
          <b-collapse
            :id="'accordion-' + (index + 1)"
            :visible="accordion.visible"
            accordion="my-accordion"
            role="tabpanel"
          >
            <b-card-body>
              <div
                class="field-group flex justify-between align-items-center"
                v-for="vms in accordion.value.vms.body"
              >
                <div class="field-title-box">
                  {{ vms.title }}
                </div>
                <div class="field-content-box">
                  <template v-if="vms.type === 'text'">
                    <p-text-input
                      :size="'md'"
                      block
                      v-model="vms['model'].value"
                      :invalid="!vms['model'].isValid"
                      @blur="vms['model'].onBlur"
                    ></p-text-input>
                  </template>

                  <template v-else-if="vms.type === 'select'">
                    <b-form-select
                      v-model="vms['selected']"
                      :options="vms['options']"
                      :required="true"
                    ></b-form-select>
                  </template>
                </div>
              </div>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
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

  .accordion {
    .card {
      border: none;

      .card-header {
        height: 44px;
        background-color: transparent;
        padding: 0;

        .field-group {
          border-bottom: none;
          .field-title-box {
            padding-left: 10px;
          }
        }

        .p-button {
          transition: transform 0.1s;
        }

        .p-button.collapsed {
        }

        .p-button.not-collapsed {
          transform: rotate(180deg);
        }
      }

      .card-body {
        padding: 0;

        .field-group {
          border-bottom: none;
          .field-title-box {
            padding-left: 34px;
          }
        }

        .field-content-box {
          .custom-select {
            @apply border border-gray-300 w-[100%] h-[100%];
            border-radius: 4px;
          }
        }
      }
    }
  }
}
</style>
