import { insertDynamicComponent } from '@/shared/utils';
import { getSequencePath } from '@/features/sequential/designer/editor/model/utils';
import TaskComponentEditor from '@/features/sequential/designer/editor/ui/TaskComponentEditor.vue';
import ContainerNameEditor from '@/features/sequential/designer/editor/ui/ContainerNameEditor.vue';
import BashTaskEditor from '@/features/sequential/designer/editor/ui/BashTaskEditor.vue';
import SshTaskEditor from '@/features/sequential/designer/editor/ui/SshTaskEditor.vue';
import HttpXcomTaskEditor from '@/features/sequential/designer/editor/ui/HttpXcomTaskEditor.vue';
import TriggerWorkflowTaskEditor from '@/features/sequential/designer/editor/ui/TriggerWorkflowTaskEditor.vue';

// cm-cicada task type → dedicated editor component. http (and unknown) falls
// back to the schema-driven TaskComponentEditor.
const TASK_TYPE_EDITOR: Record<string, any> = {
  bash: BashTaskEditor,
  ssh: SshTaskEditor,
  http_xcom: HttpXcomTaskEditor,
  trigger_workflow: TriggerWorkflowTaskEditor,
};

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
        const ifEditor = document.createElement('div');
        ifEditor.className = 'sqd-editor-wrapper';
        ifEditor.innerHTML = `
          <div class="sqd-editor-header">If Step Settings</div>
          <div class="sqd-editor-body">
            <div class="sqd-editor-field">
              <label>Name:</label>
              <input type="text" id="if-name" value="${step.name}" style="width: 100%; padding: 8px; margin-top: 4px;" />
            </div>
            <p style="margin-top: 16px; color: #666;">조건에 따라 true 또는 false 브랜치로 분기합니다.</p>
          </div>
        `;

        const nameInput = ifEditor.querySelector('#if-name') as HTMLInputElement;
        nameInput?.addEventListener('input', (e) => {
          step.name = (e.target as HTMLInputElement).value;
          stepContext.notifyNameChanged();
        });

        editor.appendChild(ifEditor);
      }
      if (step.componentType === 'launchPad' || step.componentType === 'container') {
        insertDynamicComponent(
          ContainerNameEditor,
          { step, definition },
          {
            saveComponentName: (name) => {
              step.name = name;
              stepContext.notifyNameChanged();
            },
          },
          editor,
        );
      }
      if (step.componentType === 'task') {
        // cm-cicada task type에 따라 전용 에디터 선택 (없으면 범용 TaskComponentEditor)
        const taskType = step.properties?.taskType;
        const TaskEditorComponent: any =
          (taskType && TASK_TYPE_EDITOR[taskType]) || TaskComponentEditor;

        console.log('=== Task Editor Selection ===');
        console.log('Step name:', step.name);
        console.log('Task type:', taskType);
        console.log('Selected editor:', TaskEditorComponent?.name || 'TaskComponentEditor');
        console.log('=============================');

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
              console.log('\n');
              console.log('💾💾💾 editorProviders.saveContext CALLED 💾💾💾');
              console.log('   Step name:', step.name);
              console.log('   Received model type:', typeof e);
              console.log('   Received model keys:', Object.keys(e || {}));
              
              // Deep inspection
              if (e && typeof e === 'object') {
                if (e.targetSoftwareModel && e.targetSoftwareModel.servers) {
                  console.log(`   Received model.targetSoftwareModel.servers: array[${e.targetSoftwareModel.servers.length}]`);
                  if (e.targetSoftwareModel.servers.length > 0) {
                    console.log('   First server.source_connection_info_id:', e.targetSoftwareModel.servers[0].source_connection_info_id);
                  }
                }
              }
              
              console.log('   Received model JSON (first 500 chars):', JSON.stringify(e).substring(0, 500));
              console.log('   BEFORE: step.properties.model JSON (first 500 chars):', JSON.stringify(step.properties.model).substring(0, 500));
              
              step.properties.model = e;
              
              console.log('   AFTER: step.properties.model JSON (first 500 chars):', JSON.stringify(step.properties.model).substring(0, 500));
              console.log('   ✅ step.properties.model updated');
              
              stepContext.notifyPropertiesChanged();
              console.log('   ✅ stepContext.notifyPropertiesChanged() called');
              console.log('💾💾💾 editorProviders.saveContext COMPLETE 💾💾💾');
              console.log('\n');
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
