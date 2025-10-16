<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import { onBeforeMount, onBeforeUnmount, ref, watch, computed } from 'vue';
import { useGrasshopperTaskEditorModel } from '@/features/sequential/designer/editor/model/grasshopperTaskEditorModel';
import BAccordion from '@/shared/ui/Input/Accordian/BAccordion.vue';
import SequentialShortCut from '@/features/sequential/designer/shortcut/ui/SequentialShortCut.vue';
import SoftwareModelEditor from './SoftwareModelEditor.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

interface IProps {
  step: Step;
}

// SAMPLE SW-MIGRATE WORKFLOW 데이터 구조에 맞는 Context 타입들
type ServerContext = {
  type: 'server';
  context: {
    subject: string;
    values: Array<ErrorContext | MigrationListContext | SourceConnectionContext>;
  };
  index: number;
  originalData: any;
};

type ErrorContext = {
  type: 'error';
  context: {
    subject: 'errors';
    values: Array<InputContext>;
  };
};

type MigrationListContext = {
  type: 'migrationList';
  context: {
    subject: 'migration_list';
    values: Array<BinariesContext | ContainersContext | KubernetesContext | PackagesContext>;
  };
};

type BinariesContext = {
  type: 'binaries';
  context: {
    subject: 'binaries';
    values: Array<BinaryItemContext>;
  };
};

type BinaryItemContext = {
  type: 'binaryItem';
  context: {
    subject: string;
    values: Array<InputContext>;
  };
  index: number;
  originalData: any;
};

type ContainersContext = {
  type: 'containers';
  context: {
    subject: 'containers';
    values: Array<ContainerItemContext>;
  };
};

type ContainerItemContext = {
  type: 'containerItem';
  context: {
    subject: string;
    values: Array<InputContext | ContainerImageContext | ContainerPortsContext | EnvsContext>;
  };
  index: number;
  originalData: any;
};

type ContainerImageContext = {
  type: 'containerImage';
  context: {
    subject: 'container_image';
    values: Array<InputContext>;
  };
};

type ContainerPortsContext = {
  type: 'containerPorts';
  context: {
    subject: 'container_ports';
    values: Array<PortItemContext>;
  };
};

type PortItemContext = {
  type: 'portItem';
  context: {
    subject: string;
    values: Array<InputContext>;
  };
  index: number;
  originalData: any;
};

type EnvsContext = {
  type: 'envs';
  context: {
    subject: 'envs';
    values: Array<EnvItemContext>;
  };
};

type EnvItemContext = {
  type: 'envItem';
  context: {
    subject: string;
    values: Array<InputContext>;
  };
  index: number;
  originalData: any;
};

type KubernetesContext = {
  type: 'kubernetes';
  context: {
    subject: 'kubernetes';
    values: Array<K8sItemContext>;
  };
};

type K8sItemContext = {
  type: 'k8sItem';
  context: {
    subject: string;
    values: Array<InputContext | ResourcesContext | VeleroContext>;
  };
  index: number;
  originalData: any;
};

type ResourcesContext = {
  type: 'resources';
  context: {
    subject: 'resources';
    values: Array<InputContext>;
  };
};

type VeleroContext = {
  type: 'velero';
  context: {
    subject: 'velero';
    values: Array<InputContext>;
  };
};

type PackagesContext = {
  type: 'packages';
  context: {
    subject: 'packages';
    values: Array<PackageItemContext>;
  };
};

type PackageItemContext = {
  type: 'packageItem';
  context: {
    subject: string;
    values: Array<InputContext>;
  };
  index: number;
  originalData: any;
};

type SourceConnectionContext = {
  type: 'sourceConnection';
  context: {
    subject: 'source_connection_info_id';
    values: Array<InputContext>;
  };
};

type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: any;
  };
};

type ConvertedData = ServerContext | InputContext;

const props = defineProps<IProps>();
const emit = defineEmits([
  'saveComponentName',
  'saveContext',
  'saveFixedModel',
]);

const taskEditorModel = useGrasshopperTaskEditorModel();
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

// targetSoftwareModel인 경우 SoftwareModelEditor를 사용할지 결정하는 computed
const shouldUseSoftwareModelEditor = computed(() => {
  if (!taskEditorModel.formContext.value || !Array.isArray(taskEditorModel.formContext.value)) {
    return false;
  }
  return taskEditorModel.formContext.value.some((ctx: any) => ctx.type === 'targetSoftwareModel');
});

onBeforeMount(() => {
  // targetSoftwareModel 데이터 설정 - setGrasshopperBodyParamsContext 사용
  if (props.step.properties.model) {
    console.log('GrassHopperSWMigrationTaskEditor - Body Params 설정:', props.step.properties.model);
    taskEditorModel.setGrasshopperBodyParamsContext(props.step.properties.model);
  }
  
  if (props.step.properties.fixedModel) {
    taskEditorModel.setParamsContext(props.step.properties.fixedModel);
  }

  taskEditorModel.setComponentName(props.step.name);

  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  taskEditorModel.componentNameModel,
  nv => {
    if (nv.context.model.value !== '') {
      emit('saveComponentName', nv.context.model.value);
    }
  },
  { deep: true },
);

watch(
  taskEditorModel.formContext,
  nv => {
    if (nv) {
      const convertedData = taskEditorModel.convertGrasshopperFormModelToStepProperties();
      emit('saveContext', convertedData);
    }
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

// Vue 2 호환 헬퍼 함수들 - try-catch로 오류 방지
function getServerErrors(server: any) {
  try {
    if (!server || !server.context || !server.context.values) return [];
    const errorsField = server.context.values.find((f: any) => f.context && f.context.subject === 'errors');
    return errorsField ? errorsField.context.values || [] : [];
  } catch (error) {
    console.error('getServerErrors error:', error);
    return [];
  }
}

function getMigrationList(server: any) {
  try {
    if (!server || !server.context || !server.context.values) {
      console.log('getMigrationList: server or context not found', { server, context: server?.context });
      return null;
    }
    
    console.log('getMigrationList: server.context.values', server.context.values);
    const migrationList = server.context.values.find((f: any) => f.context && f.context.subject === 'migration_list');
    console.log('getMigrationList: found migration_list', migrationList);
    return migrationList;
  } catch (error) {
    console.error('getMigrationList error:', error);
    return null;
  }
}

function getBinaries(server: any) {
  try {
    const migrationList = getMigrationList(server);
    if (!migrationList || !migrationList.context || !migrationList.context.values) return [];
    const binariesField = migrationList.context.values.find((m: any) => m.context && m.context.subject === 'binaries');
    return binariesField ? binariesField.context.values || [] : [];
  } catch (error) {
    console.error('getBinaries error:', error);
    return [];
  }
}

function getContainers(server: any) {
  try {
    const migrationList = getMigrationList(server);
    if (!migrationList || !migrationList.context || !migrationList.context.values) return [];
    const containersField = migrationList.context.values.find((m: any) => m.context && m.context.subject === 'containers');
    return containersField ? containersField.context.values || [] : [];
  } catch (error) {
    console.error('getContainers error:', error);
    return [];
  }
}

function getKubernetes(server: any) {
  try {
    const migrationList = getMigrationList(server);
    if (!migrationList || !migrationList.context || !migrationList.context.values) return [];
    const k8sField = migrationList.context.values.find((m: any) => m.context && m.context.subject === 'kubernetes');
    return k8sField ? k8sField.context.values || [] : [];
  } catch (error) {
    console.error('getKubernetes error:', error);
    return [];
  }
}

function getPackages(server: any) {
  try {
    const migrationList = getMigrationList(server);
    if (!migrationList || !migrationList.context || !migrationList.context.values) return [];
    const packagesField = migrationList.context.values.find((m: any) => m.context && m.context.subject === 'packages');
    return packagesField ? packagesField.context.values || [] : [];
  } catch (error) {
    console.error('getPackages error:', error);
    return [];
  }
}

function getSourceConnection(server: any) {
  try {
    if (!server || !server.context || !server.context.values) return null;
    const sourceField = server.context.values.find((f: any) => f.context && f.context.subject === 'source_connection_info_id');
    return sourceField && sourceField.context && sourceField.context.values && sourceField.context.values[0] ? sourceField.context.values[0] : null;
  } catch (error) {
    console.error('getSourceConnection error:', error);
    return null;
  }
}

// 복잡한 중첩 구조를 위한 추가 헬퍼 함수들 - try-catch로 오류 방지
function getContainerImage(container: any) {
  try {
    if (!container || !container.context || !container.context.values) return null;
    return container.context.values.find((f: any) => f.context && f.context.subject === 'container_image');
  } catch (error) {
    console.error('getContainerImage error:', error);
    return null;
  }
}

function getContainerPorts(container: any) {
  try {
    if (!container || !container.context || !container.context.values) return [];
    const portsField = container.context.values.find((f: any) => f.context && f.context.subject === 'container_ports');
    return portsField ? portsField.context.values || [] : [];
  } catch (error) {
    console.error('getContainerPorts error:', error);
    return [];
  }
}

function getContainerEnvs(container: any) {
  try {
    if (!container || !container.context || !container.context.values) return [];
    const envsField = container.context.values.find((f: any) => f.context && f.context.subject === 'envs');
    return envsField ? envsField.context.values || [] : [];
  } catch (error) {
    console.error('getContainerEnvs error:', error);
    return [];
  }
}

function getK8sResources(k8s: any) {
  try {
    if (!k8s || !k8s.context || !k8s.context.values) return null;
    return k8s.context.values.find((f: any) => f.context && f.context.subject === 'resources');
  } catch (error) {
    console.error('getK8sResources error:', error);
    return null;
  }
}

function getK8sVelero(k8s: any) {
  try {
    if (!k8s || !k8s.context || !k8s.context.values) return null;
    return k8s.context.values.find((f: any) => f.context && f.context.subject === 'velero');
  } catch (error) {
    console.error('getK8sVelero error:', error);
    return null;
  }
}

function getDeploymentResources(resources: any) {
  try {
    if (!resources || !resources.context || !resources.context.values) return null;
    return resources.context.values.find((f: any) => f.context && f.context.subject === 'deployment');
  } catch (error) {
    console.error('getDeploymentResources error:', error);
    return null;
  }
}

function getResourceLimits(deployment: any) {
  try {
    if (!deployment || !deployment.context || !deployment.context.values) return null;
    const resourcesField = deployment.context.values.find((f: any) => f.context && f.context.subject === 'resources');
    return resourcesField ? resourcesField.context.values.find((f: any) => f.context && f.context.subject === 'limits') : null;
  } catch (error) {
    console.error('getResourceLimits error:', error);
    return null;
  }
}

function getResourceRequests(deployment: any) {
  try {
    if (!deployment || !deployment.context || !deployment.context.values) return null;
    const resourcesField = deployment.context.values.find((f: any) => f.context && f.context.subject === 'resources');
    return resourcesField ? resourcesField.context.values.find((f: any) => f.context && f.context.subject === 'requests') : null;
  } catch (error) {
    console.error('getResourceRequests error:', error);
    return null;
  }
}

function getArrayValues(field: any) {
  try {
    if (!field || !field.context || !field.context.values) return [];
    return field.context.values || [];
  } catch (error) {
    console.error('getArrayValues error:', error);
    return [];
  }
}

function getObjectValues(field: any) {
  try {
    if (!field || !field.context || !field.context.values) return [];
    return field.context.values || [];
  } catch (error) {
    console.error('getObjectValues error:', error);
    return [];
  }
}

function getSimpleValue(field: any) {
  try {
    if (!field || !field.context || !field.context.model) return '';
    return field.context.model.value || '';
  } catch (error) {
    console.error('getSimpleValue error:', error);
    return '';
  }
}

// BAccordion을 위한 헬퍼 함수
function getServers(context: any) {
  try {
    console.log('getServers - context:', context);
    
    // 전달받은 context가 targetSoftwareModel인 경우
    if (context && context.context && context.context.subject === 'Target Software Model') {
      console.log('getServers - context.context.values:', context.context.values);
      console.log('getServers - context.context.values[0]:', context.context.values[0]);
      console.log('getServers - context.context.values[0].context:', context.context.values[0]?.context);
      console.log('getServers - context.context.values[0].context.subject:', context.context.values[0]?.context?.subject);
      
      // context.values에서 servers를 찾기
      const serversField = context.context.values.find(
        (field: any) => field.context && field.context.subject === 'servers'
      );
      
      console.log('getServers - serversField:', serversField);
      
      if (serversField && serversField.context && serversField.context.values) {
        console.log('getServers - servers found:', serversField.context.values);
        return serversField.context.values;
      }
    }
    
    // formContext에서 찾는 경우
    if (!taskEditorModel.formContext.value || taskEditorModel.formContext.value.length === 0) return [];
    
    const targetSoftwareModel = (taskEditorModel.formContext.value as any).find(
      (ctx: any) => ctx.context && ctx.context.subject === 'targetSoftwareModel'
    );
    
    if (!targetSoftwareModel || !targetSoftwareModel.context || !targetSoftwareModel.context.values) return [];
    
    const servers = targetSoftwareModel.context.values.find(
      (field: any) => field.context && field.context.subject === 'servers'
    );
    
    return servers ? servers.context.values || [] : [];
  } catch (error) {
    console.error('getServers error:', error);
    return [];
  }
}

function getServersAccordionItems(context: any) {
  try {
    const servers = getServers(context);
    return servers.map((server, index) => ({
      header: {
        icon: 'ic_chevron-right',
        title: `Server ${index + 1}`
      },
      content: server,
      index: index
    }));
  } catch (error) {
    console.error('getServersAccordionItems error:', error);
    return [];
  }
}
</script>

<template>
  <div
    ref="editorFormElement"
    class="task-editor-form"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >
    <!-- softwareModel인 경우 SoftwareModelEditor 사용 -->
    <SoftwareModelEditor
      v-if="shouldUseSoftwareModelEditor"
      :step="props.step"
      @save-component-name="emit('saveComponentName', $event)"
      @save-context="emit('saveContext', $event)"
      @save-fixed-model="emit('saveFixedModel', $event)"
    />
    
    <!-- softwareModel이 아닌 경우 기존 로직 사용 -->
    <div v-else>
    <!-- Component Name -->
    <div class="step-name-box w-full">
      <div class="subject-title border-bottom">Component Name</div>
      <div class="field-group flex border-bottom">
        <div class="field-title-box">
          {{ taskEditorModel.componentNameModel.value.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="
              taskEditorModel.componentNameModel.value.context.model.value
            "
            :size="'md'"
            block
            readonly
          ></p-text-input>
        </div>
      </div>
    </div>

    <!-- Params Context -->
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
              <div v-if="entity.type === 'input'" class="field-title-box">
                {{ entity.context.title }}
              </div>
              <div class="field-content-box">
                <p-text-input
                  v-model="entity.context.model.value"
                  :size="'md'"
                  block
                  :invalid="!entity.context.model.isValid"
                  :readonly="entity.context.title === 'nsId'"
                  @blur="entity.context.model.onBlur"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Body Params 영역 - SAMPLE SW-MIGRATE WORKFLOW 구조 -->
    <div
      v-for="(currentContext, index) of taskEditorModel.formContext.value"
      :key="index"
      class="flex justify-between align-items-center"
    >
      <!-- Target Software Model Context -->
      <div
        v-if="currentContext.type === 'targetSoftwareModel'"
        class="target-software-model-box w-full h-full"
      >
        <div class="subject-title border-bottom">
          {{ currentContext.context.subject }}
        </div>
        
        <!-- Servers List with BAccordion -->
        <div
          v-if="currentContext.context.values && currentContext.context.values.length > 0"
          class="servers-list w-full h-full"
        >
          <!-- 디버깅 정보 -->
          <div style="background: #f0f0f0; padding: 8px; margin: 4px 0; font-size: 12px;">
            <div>Current Context Subject: {{ currentContext.context.subject }}</div>
            <div>Current Context Values Count: {{ currentContext.context.values?.length || 0 }}</div>
            <div>Servers Count: {{ getServers(currentContext).length }}</div>
            <div>Accordion Items Count: {{ getServersAccordionItems(currentContext).length }}</div>
            <div>Servers Data: {{ JSON.stringify(getServers(currentContext), null, 2) }}</div>
          </div>
          
          <!-- servers 배열을 직접 반복하여 표시 -->
          <div
            v-for="(server, serverIndex) of getServers(currentContext)" 
            :key="serverIndex"
            class="server-item"
          >
            <div class="subject-title border-bottom">
              Server {{ serverIndex + 1 }}
            </div>
            
            <!-- Server Errors -->
            <div v-if="getServerErrors(server).length > 0" class="server-errors">
              <div class="subject-title border-bottom">Errors</div>
              <div class="error-list">
                <div 
                  v-for="(error, errorIndex) of getServerErrors(server)" 
                  :key="errorIndex"
                  class="field-group flex border-bottom"
                >
                  <div class="field-title-box">Error {{ errorIndex + 1 }}</div>
                  <div class="field-content-box">
                    <p-text-input
                      v-model="error.context.model.value"
                      :size="'md'"
                      block
                      readonly
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Migration List -->
            <div v-if="getMigrationList(server)" class="migration-list-section">
              <div class="subject-title border-bottom">Migration List</div>
              
              <!-- 디버깅 정보 -->
              <div style="background: #f0f0f0; padding: 8px; margin: 4px 0; font-size: 12px;">
                <div>Migration List Found: {{ !!getMigrationList(server) }}</div>
                <div>Binaries Count: {{ getBinaries(server).length }}</div>
                <div>Containers Count: {{ getContainers(server).length }}</div>
                <div>Kubernetes Count: {{ getKubernetes(server).length }}</div>
                <div>Packages Count: {{ getPackages(server).length }}</div>
              </div>
              
              <!-- Binaries -->
              <div v-if="getBinaries(server).length > 0" class="binaries-section">
                <div class="subject-title border-bottom">Binaries</div>
                <div 
                  v-for="(binary, binaryIndex) of getBinaries(server)" 
                  :key="binaryIndex"
                  class="binary-item"
                >
                  <div class="subject-title border-bottom">Binary {{ binaryIndex + 1 }}</div>
                  <div
                    v-for="(element, elementIndex) in binary.context.values"
                    :key="elementIndex"
                    class="field-group flex border-bottom"
                  >
                    <div class="field-title-box">
                      {{ element.context.title }}
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        v-model="element.context.model.value"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Containers -->
              <div v-if="getContainers(server).length > 0" class="containers-section">
                <div class="subject-title border-bottom">Containers</div>
                <div 
                  v-for="(container, containerIndex) of getContainers(server)" 
                  :key="containerIndex"
                  class="container-item"
                >
                  <div class="subject-title border-bottom">Container {{ containerIndex + 1 }}</div>
                  
                  <!-- Container 기본 필드들 -->
                  <div
                    v-for="(element, elementIndex) in container.context.values"
                    :key="elementIndex"
                    v-if="!['container_image', 'container_ports', 'envs'].includes(element.context.subject)"
                    class="field-group flex border-bottom"
                  >
                    <div class="field-title-box">
                      {{ element.context.title }}
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        v-model="element.context.model.value"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>

                  <!-- Container Image -->
                  <div v-if="getContainerImage(container)" class="container-image-section">
                    <div class="subject-title border-bottom">Container Image</div>
                    <div
                      v-for="(imgField, imgIndex) in getObjectValues(getContainerImage(container))"
                      :key="imgIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        {{ imgField.context.title }}
                      </div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="imgField.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!imgField.context.model.isValid"
                          @blur="imgField.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Container Ports -->
                  <div v-if="getContainerPorts(container).length > 0" class="container-ports-section">
                    <div class="subject-title border-bottom">Container Ports</div>
                    <div
                      v-for="(port, portIndex) of getContainerPorts(container)"
                      :key="portIndex"
                      class="port-item"
                    >
                      <div class="subject-title border-bottom">Port {{ portIndex + 1 }}</div>
                      <div
                        v-for="(portField, portFieldIndex) in getObjectValues(port)"
                        :key="portFieldIndex"
                        class="field-group flex border-bottom"
                      >
                        <div class="field-title-box">
                          {{ portField.context.title }}
                        </div>
                        <div class="field-content-box">
                          <p-text-input
                            v-model="portField.context.model.value"
                            :size="'md'"
                            block
                            :invalid="!portField.context.model.isValid"
                            @blur="portField.context.model.onBlur"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Environment Variables -->
                  <div v-if="getContainerEnvs(container).length > 0" class="container-envs-section">
                    <div class="subject-title border-bottom">Environment Variables</div>
                    <div
                      v-for="(env, envIndex) of getContainerEnvs(container)"
                      :key="envIndex"
                      class="env-item"
                    >
                      <div class="subject-title border-bottom">Env {{ envIndex + 1 }}</div>
                      <div
                        v-for="(envField, envFieldIndex) in getObjectValues(env)"
                        :key="envFieldIndex"
                        class="field-group flex border-bottom"
                      >
                        <div class="field-title-box">
                          {{ envField.context.title }}
                        </div>
                        <div class="field-content-box">
                          <p-text-input
                            v-model="envField.context.model.value"
                            :size="'md'"
                            block
                            :invalid="!envField.context.model.isValid"
                            @blur="envField.context.model.onBlur"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Kubernetes -->
              <div v-if="getKubernetes(server).length > 0" class="kubernetes-section">
                <div class="subject-title border-bottom">Kubernetes</div>
                <div 
                  v-for="(k8s, k8sIndex) of getKubernetes(server)" 
                  :key="k8sIndex"
                  class="k8s-item"
                >
                  <div class="subject-title border-bottom">Kubernetes {{ k8sIndex + 1 }}</div>
                  
                  <!-- K8s 기본 필드들 -->
                  <div
                    v-for="(element, elementIndex) in k8s.context.values"
                    :key="elementIndex"
                    v-if="!['resources', 'velero'].includes(element.context.subject)"
                    class="field-group flex border-bottom"
                  >
                    <div class="field-title-box">
                      {{ element.context.title }}
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        v-model="element.context.model.value"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>

                  <!-- Resources -->
                  <div v-if="getK8sResources(k8s)" class="k8s-resources-section">
                    <div class="subject-title border-bottom">Resources</div>
                    <div
                      v-for="(resField, resIndex) in getObjectValues(getK8sResources(k8s))"
                      :key="resIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        {{ resField.context.title }}
                      </div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="resField.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!resField.context.model.isValid"
                          @blur="resField.context.model.onBlur"
                        />
                      </div>
                    </div>

                    <!-- Deployment Resources -->
                    <div v-if="getDeploymentResources(getK8sResources(k8s))" class="deployment-resources-section">
                      <div class="subject-title border-bottom">Deployment Resources</div>
                      <div
                        v-for="(deployField, deployIndex) in getObjectValues(getDeploymentResources(getK8sResources(k8s)))"
                        :key="deployIndex"
                        class="field-group flex border-bottom"
                      >
                        <div class="field-title-box">
                          {{ deployField.context.title }}
                        </div>
                        <div class="field-content-box">
                          <p-text-input
                            v-model="deployField.context.model.value"
                            :size="'md'"
                            block
                            :invalid="!deployField.context.model.isValid"
                            @blur="deployField.context.model.onBlur"
                          />
                        </div>
                      </div>

                      <!-- Resource Limits -->
                      <div v-if="getResourceLimits(getDeploymentResources(getK8sResources(k8s)))" class="resource-limits-section">
                        <div class="subject-title border-bottom">Resource Limits</div>
                        <div
                          v-for="(limitField, limitIndex) in getObjectValues(getResourceLimits(getDeploymentResources(getK8sResources(k8s))))"
                          :key="limitIndex"
                          class="field-group flex border-bottom"
                        >
                          <div class="field-title-box">
                            {{ limitField.context.title }}
                          </div>
                          <div class="field-content-box">
                            <p-text-input
                              v-model="limitField.context.model.value"
                              :size="'md'"
                              block
                              :invalid="!limitField.context.model.isValid"
                              @blur="limitField.context.model.onBlur"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Resource Requests -->
                      <div v-if="getResourceRequests(getDeploymentResources(getK8sResources(k8s)))" class="resource-requests-section">
                        <div class="subject-title border-bottom">Resource Requests</div>
                        <div
                          v-for="(requestField, requestIndex) in getObjectValues(getResourceRequests(getDeploymentResources(getK8sResources(k8s))))"
                          :key="requestIndex"
                          class="field-group flex border-bottom"
                        >
                          <div class="field-title-box">
                            {{ requestField.context.title }}
                          </div>
                          <div class="field-content-box">
                            <p-text-input
                              v-model="requestField.context.model.value"
                              :size="'md'"
                              block
                              :invalid="!requestField.context.model.isValid"
                              @blur="requestField.context.model.onBlur"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Velero -->
                  <div v-if="getK8sVelero(k8s)" class="k8s-velero-section">
                    <div class="subject-title border-bottom">Velero</div>
                    <div
                      v-for="(velField, velIndex) in getObjectValues(getK8sVelero(k8s))"
                      :key="velIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        {{ velField.context.title }}
                      </div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="velField.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!velField.context.model.isValid"
                          @blur="velField.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Packages -->
              <div v-if="getPackages(server).length > 0" class="packages-section">
                <div class="subject-title border-bottom">Packages</div>
                <div 
                  v-for="(pkg, pkgIndex) of getPackages(server)" 
                  :key="pkgIndex"
                  class="package-item"
                >
                  <div class="subject-title border-bottom">Package {{ pkgIndex + 1 }}</div>
                  
                  <!-- Package 기본 필드들 -->
                  <div
                    v-for="(element, elementIndex) in pkg.context.values"
                    :key="elementIndex"
                    v-if="!['custom_configs', 'custom_data_paths', 'needed_libraries', 'need_to_delete_packages', 'needed_packages'].includes(element.context.subject)"
                    class="field-group flex border-bottom"
                  >
                    <div class="field-title-box">
                      {{ element.context.title }}
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        v-model="element.context.model.value"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>

                  <!-- Custom Configs Array -->
                  <div v-if="pkg.context.values.find(f => f.context.subject === 'custom_configs')" class="custom-configs-section">
                    <div class="subject-title border-bottom">Custom Configs</div>
                    <div
                      v-for="(config, configIndex) of getArrayValues(pkg.context.values.find(f => f.context.subject === 'custom_configs'))"
                      :key="configIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">Config {{ configIndex + 1 }}</div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="config.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!config.context.model.isValid"
                          @blur="config.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Custom Data Paths Array -->
                  <div v-if="pkg.context.values.find(f => f.context.subject === 'custom_data_paths')" class="custom-data-paths-section">
                    <div class="subject-title border-bottom">Custom Data Paths</div>
                    <div
                      v-for="(path, pathIndex) of getArrayValues(pkg.context.values.find(f => f.context.subject === 'custom_data_paths'))"
                      :key="pathIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">Path {{ pathIndex + 1 }}</div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="path.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!path.context.model.isValid"
                          @blur="path.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Needed Libraries Array -->
                  <div v-if="pkg.context.values.find(f => f.context.subject === 'needed_libraries')" class="needed-libraries-section">
                    <div class="subject-title border-bottom">Needed Libraries</div>
                    <div
                      v-for="(lib, libIndex) of getArrayValues(pkg.context.values.find(f => f.context.subject === 'needed_libraries'))"
                      :key="libIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">Library {{ libIndex + 1 }}</div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="lib.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!lib.context.model.isValid"
                          @blur="lib.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Need to Delete Packages Array -->
                  <div v-if="pkg.context.values.find(f => f.context.subject === 'need_to_delete_packages')" class="delete-packages-section">
                    <div class="subject-title border-bottom">Need to Delete Packages</div>
                    <div
                      v-for="(delPkg, delIndex) of getArrayValues(pkg.context.values.find(f => f.context.subject === 'need_to_delete_packages'))"
                      :key="delIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">Package {{ delIndex + 1 }}</div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="delPkg.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!delPkg.context.model.isValid"
                          @blur="delPkg.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Needed Packages Array -->
                  <div v-if="pkg.context.values.find(f => f.context.subject === 'needed_packages')" class="needed-packages-section">
                    <div class="subject-title border-bottom">Needed Packages</div>
                    <div
                      v-for="(needPkg, needIndex) of getArrayValues(pkg.context.values.find(f => f.context.subject === 'needed_packages'))"
                      :key="needIndex"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">Package {{ needIndex + 1 }}</div>
                      <div class="field-content-box">
                        <p-text-input
                          v-model="needPkg.context.model.value"
                          :size="'md'"
                          block
                          :invalid="!needPkg.context.model.isValid"
                          @blur="needPkg.context.model.onBlur"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <!-- Source Connection -->
              <div v-if="getSourceConnection(server)" class="source-connection">
                <div class="subject-title border-bottom">Source Connection</div>
                <div class="field-group flex border-bottom">
                  <div class="field-title-box">Connection ID</div>
                  <div class="field-content-box">
                    <p-text-input
                      v-model="getSourceConnection(server).context.model.value"
                      :size="'md'"
                      block
                      readonly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      />
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

/* SAMPLE SW-MIGRATE WORKFLOW 전용 스타일 */
.server-errors {
  margin: 8px 0;
  padding: 8px;
  background-color: #fff5f5;
  border-left: 3px solid #f56565;
}

.migration-list-section {
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f8ff;
  border-left: 3px solid #3182ce;
}

.binaries-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0fff4;
  border-left: 3px solid #38a169;
}

.containers-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #fffaf0;
  border-left: 3px solid #ed8936;
}

.kubernetes-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #faf5ff;
  border-left: 3px solid #805ad5;
}

.packages-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0fdf4;
  border-left: 3px solid #22c55e;
}

.source-connection {
  margin: 8px 0;
  padding: 8px;
  background-color: #fefce8;
  border-left: 3px solid #eab308;
}

/* 복잡한 중첩 구조를 위한 추가 스타일 */
.container-image-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0f9ff;
  border-left: 3px solid #0ea5e9;
}

.container-ports-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0fdf4;
  border-left: 3px solid #22c55e;
}

.container-envs-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
}

.k8s-resources-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f3e8ff;
  border-left: 3px solid #8b5cf6;
}

.deployment-resources-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #f8fafc;
  border-left: 2px solid #64748b;
}

.resource-limits-section {
  margin: 4px 0;
  padding: 4px;
  background-color: #fef2f2;
  border-left: 2px solid #ef4444;
}

.resource-requests-section {
  margin: 4px 0;
  padding: 4px;
  background-color: #f0fdf4;
  border-left: 2px solid #10b981;
}

.k8s-velero-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #fef7ff;
  border-left: 3px solid #d946ef;
}

.custom-configs-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #f0f9ff;
  border-left: 2px solid #0ea5e9;
}

.custom-data-paths-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #f0fdf4;
  border-left: 2px solid #22c55e;
}

.needed-libraries-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #fef3c7;
  border-left: 2px solid #f59e0b;
}

.delete-packages-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #fef2f2;
  border-left: 2px solid #ef4444;
}

.needed-packages-section {
  margin: 6px 0;
  padding: 6px;
  background-color: #f0fdf4;
  border-left: 2px solid #10b981;
}

.port-item, .env-item {
  margin: 4px 0;
  padding: 4px;
  background-color: white;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
}
</style>
