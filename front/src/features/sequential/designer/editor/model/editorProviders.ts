import { insertDynamicComponent } from '@/shared/utils';
import { getSequencePath } from '@/features/sequential/designer/editor/model/utils';
import BeetleTaskEditor from '@/features/sequential/designer/editor/ui/BeetleTaskEditor.vue';
import GrasshopperTaskEditor from '@/features/sequential/designer/editor/ui/GrasshopperTaskEditor.vue';
import CommonTaskEditor from '@/features/sequential/designer/editor/ui/CommonTaskEditor.vue';

export function editorProviders() {
  const editor = document.createElement('div');
  editor.style.width = '100%';
  editor.style.height = '100%';

  return {
    defaultRootEditorProvider: function (definition, rootContext, isReadonly) {
      const textArea = document.createElement('textarea');
      textArea.style.width = '100%';
      textArea.style.height = '95%';
      textArea.setAttribute('readonly', 'readonly');
      textArea.value = JSON.stringify(definition, null, 2);

      editor.appendChild(textArea);
      return editor;
    },
    defaultStepEditorProvider: function (
      step,
      stepContext,
      definition,
      isReadonly,
    ) {
      //각각에 만들어야할 Vue component 정의
      if (step.componentType === 'switch' && step.type == 'if') {
      }
      if (step.componentType === 'container') {
      }
      if (step.componentType === 'task') {
        // taskComponent에 따라 다른 editor 사용
        let TaskEditorComponent = CommonTaskEditor; // 기본값: CommonTaskEditor 사용
        
        // 특정 task들만 전용 editor 사용
        if (step.name === 'beetle_task_infra_migration' || 
            step.properties?.fixedModel?.task_component === 'beetle_task_infra_migration') {
          TaskEditorComponent = BeetleTaskEditor;
        } else if (step.name === 'grasshopper_task_software_migration' || 
                   step.properties?.fixedModel?.task_component === 'grasshopper_task_software_migration') {
          TaskEditorComponent = GrasshopperTaskEditor;
        }
        
        //toolboxModel에서 가공하는곳 참고
        insertDynamicComponent(
          TaskEditorComponent,
          { step },
          {
            saveComponentName: e => {
              step.name = e;
              stepContext.notifyNameChanged();
            },
            saveContext: e => {
              step.properties.model = e;
              stepContext.notifyPropertiesChanged();
            },
            saveFixedModel: e => {
              step.properties.fixedModel = e;
              stepContext.notifyPropertiesChanged();
            },
          },
          editor,
        );
      }

      const label = document.createElement('label');
      label.innerText = getSequencePath(definition.sequence, step.id) ?? '';
      editor.appendChild(label);

      return editor;
    },
  };
}
