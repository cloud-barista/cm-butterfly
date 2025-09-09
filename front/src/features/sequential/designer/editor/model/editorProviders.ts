import { insertDynamicComponent } from '@/shared/utils';
import { getSequencePath } from '@/features/sequential/designer/editor/model/utils';
import BeetleTaskEditor from '@/features/sequential/designer/editor/ui/BeetleTaskEditor.vue';

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
        //toolboxModel에서 가공하는곳 참고
        insertDynamicComponent(
          BeetleTaskEditor,
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
