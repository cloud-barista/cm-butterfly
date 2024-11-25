<script setup lang="ts">
import { onMounted, reactive, ref, triggerRef, watch } from 'vue';
import { useSequentialDesignerModel } from '@/features/workflow/workflowEditor/sequential/designer/model/sequentialDesignerModel.ts';

import { useSequentialToolboxModel } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxModel.ts';
import { Designer } from 'sequential-workflow-designer';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';
import { ITaskComponentInfoResponse } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';
import { Definition } from 'sequential-workflow-model';

interface IProps {
  sequence: Step[];
  trigger: any;
  taskComponentList: Array<ITaskComponentInfoResponse> | undefined;
}

const props = defineProps<IProps>();
const emit = defineEmits(['getDesigner']);
const sequentialToolBoxModel = useSequentialToolboxModel();
const sequentialDesignerModel = ref();

onMounted(function () {
  let refs = this.$refs;

  const taskComponents = sequentialToolBoxModel.getTaskComponentStep(
    props.taskComponentList ?? [],
  );
  sequentialDesignerModel.value = useSequentialDesignerModel(refs);
  sequentialDesignerModel.value.setToolboxGroupsSteps(null, null, [
    ...taskComponents,
  ]);
  sequentialDesignerModel.value.setDefaultSequence(props.sequence);
  sequentialDesignerModel.value.initDesigner();
  sequentialDesignerModel.value.draw();
});

watch(
  () => props.sequence,
  () => {
    const designer: Designer = sequentialDesignerModel.value.getDesigner();
    const definition: Definition = {
      properties: designer.getDefinition().properties,
      sequence: props.sequence,
    };
    designer.replaceDefinition(definition);
  },
);

watch(
  () => props.trigger,
  nv => {
    if (nv) emit('getDesigner', sequentialDesignerModel.value.getDesigner());
  },
  { deep: true },
);
</script>

<template>
  <div class="w-[100%] h-[100%] source-template-workflow-edit-container">
    <section class="w-[100%] h-[100%] workflow-box">
      <div ref="placeholder" class="w-[100%] h-[100%]"></div>
    </section>
  </div>
</template>

<style lang="postcss">
@import '@/../node_modules/sequential-workflow-designer/css/designer.css';
@import '@/../node_modules/sequential-workflow-designer/css/designer-light.css';
@import '@/../node_modules/sequential-workflow-designer/css/designer-dark.css';

.source-template-workflow-edit-container {
  .workflow-box {
    @apply border-gray-200;
    width: 100%;
    height: 100%;
    border-style: solid;
    border-width: 1px;
    border-radius: 6px;
    padding: 2px;
    .sqd-toolbox {
      width: 280px;
    }

    .sqd-smart-editor-toggle {
      right: 500px;
    }

    .sqd-smart-editor-toggle.sqd-collapsed {
      right: 0;
    }

    .sqd-smart-editor {
      width: 500px;

      .sqd-editor {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
