<script setup lang="ts">
import {
  PButtonModal,
  PFieldGroup,
  PTextInput,
  PSelectDropdown,
  PTextarea,
  PRadio,
  PRadioGroup,
  PToggleButton,
  PDivider,
} from '@cloudforet-test/mirinae';
import { useLoadConfigModel } from '@/features/workload/actionLoadConfig/model';
import { watch, ref, onMounted } from 'vue';
import { showErrorMessage } from '@/shared/utils';
import {
  useRunLoadTest,
  useGetAllLoadTestScenarioCatalogs,
} from '@/entities/vm/api/api';

interface IProps {
  isOpen: boolean;
  nsId: string;
  mciId: string;
  vmId: string;
  ip: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['close', 'success']);

const loadConfigModel = useLoadConfigModel();
const resRunLoadTest = useRunLoadTest(null);

// API 훅
const { data: catalogsData, execute: fetchCatalogs } =
  useGetAllLoadTestScenarioCatalogs();

// 템플릿 관련 상태
const savedTemplates = ref<any[]>([]);
const selectedTemplate = ref<string>('');

// 템플릿 로드
async function loadTemplates() {
  try {
    await fetchCatalogs();
    if (catalogsData.value?.responseData?.result?.loadTestScenarioCatalogs) {
      savedTemplates.value =
        catalogsData.value.responseData.result.loadTestScenarioCatalogs;
    } else {
      savedTemplates.value = [];
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
    showErrorMessage('failed', 'Failed to load templates. Please try again.');
  }
}

// 템플릿 선택 시 필드 자동 채우기
function applyTemplate(templateName: string) {
  if (!templateName) return;

  // 선택된 템플릿 찾기
  const template = savedTemplates.value.find(t => t.name === templateName);
  if (!template) return;

  // 템플릿 데이터를 폼에 적용
  loadConfigModel.inputModels.virtualUsers.value = template.virtualUsers;
  loadConfigModel.inputModels.testDuration.value = template.duration;
  loadConfigModel.inputModels.rampUpTime.value = template.rampUpTime;
  loadConfigModel.inputModels.rampUpSteps.value = template.rampUpSteps;
}

// 템플릿 적용을 위한 expose
defineExpose({
  applyTemplate,
});

// 컴포넌트 마운트 시 템플릿 로드
onMounted(() => {
  loadTemplates();
});

watch(
  () => props.ip,
  () => {
    loadConfigModel.inputModels.agentHostName.value = props.ip;
    loadConfigModel.inputModels.targetHostName.value = props.ip;
  },
  { immediate: true },
);

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      loadTemplates();
      selectedTemplate.value = '';
    }
  },
);

async function validate() {
  const inputModels = loadConfigModel.inputModels;
  const validationPromises = Object.keys(inputModels).map(key =>
    inputModels[key].exeValidation(inputModels[key].value),
  );

  await Promise.all(validationPromises);
  return Object.keys(inputModels).every(key => inputModels[key].isValid);
}

async function handleConfirm() {
  const isValid = await validate();

  if (isValid && !resRunLoadTest.isLoading.value) {
    resRunLoadTest
      .execute({
        request: {
          agentHostName: loadConfigModel.inputModels.agentHostName.value,
          collectAdditionalSystemMetrics: loadConfigModel.isMetrics.value,
          httpReqs: [
            {
              method: loadConfigModel.methods.selected,
              protocol: loadConfigModel.protocol.selected,
              bodyData: loadConfigModel.inputModels.bodyData.value,
              hostName: loadConfigModel.inputModels.targetHostName.value,
              port: loadConfigModel.inputModels.port.value,
              path: loadConfigModel.inputModels.path.value,
            },
          ],
          installLoadGenerator: {
            installLocation: loadConfigModel.location.selected,
          },
          testName: loadConfigModel.inputModels.scenarioName.value,
          virtualUsers: loadConfigModel.inputModels.virtualUsers.value,
          duration: loadConfigModel.inputModels.testDuration.value,
          rampUpTime: loadConfigModel.inputModels.rampUpTime.value,
          rampUpSteps: loadConfigModel.inputModels.rampUpSteps.value,
          mciId: props.mciId,
          nsId: props.nsId,
          vmId: props.vmId,
        },
      })
      .then(res => {
        emit('success', loadConfigModel.inputModels.scenarioName.value);
      })
      .catch(e => {
        showErrorMessage('error', e.errorMsg);
      });
  } else {
    console.log('Some inputs are invalid');
  }
}

function handelClose() {
  // 폼 리셋
  loadConfigModel.inputModels.scenarioName.value = '';
  loadConfigModel.inputModels.targetHostName.value = '';
  loadConfigModel.inputModels.port.value = '';
  loadConfigModel.protocol.selected = 'HTTP';
  loadConfigModel.inputModels.path.value = '';
  loadConfigModel.methods.selected = 'GET';
  loadConfigModel.inputModels.bodyData.value = '';
  loadConfigModel.inputModels.virtualUsers.value = '';
  loadConfigModel.inputModels.testDuration.value = '';
  loadConfigModel.inputModels.rampUpTime.value = '';
  loadConfigModel.inputModels.rampUpSteps.value = '';
  loadConfigModel.location.selected = 'remote';
  loadConfigModel.isMetrics.value = true;
  loadConfigModel.inputModels.agentHostName.value = '';
  loadConfigModel.installed.selected = 'True';
  selectedTemplate.value = '';
  emit('close');
}
</script>

<template>
  <PButtonModal
    :visible="isOpen"
    :v-model="isOpen"
    size="sm"
    :loading="false"
    header-title="Load Config"
    @confirm="handleConfirm"
    @cancel="handelClose"
    @close="handelClose"
  >
    <template #body>
      <div class="config-form">
        <div class="title">
          <p-field-group
            :label="'Test Scenario Name'"
            required
            :invalid="!loadConfigModel.inputModels.scenarioName.isValid"
          >
            <template #default="{ invalid }">
              <p-text-input
                v-model="loadConfigModel.inputModels.scenarioName.value"
                :invalid="invalid"
                :placeholder="'Test Scenario Name'"
                block
              />
            </template>
          </p-field-group>
        </div>

        <section class="section">
          <p-field-group
            :invalid="!loadConfigModel.inputModels.targetHostName.isValid"
            :label="'Target Host Name'"
            required
          >
            <template #default="{ invalid }">
              <p-text-input
                v-model="loadConfigModel.inputModels.targetHostName.value"
                :invalid="invalid"
                :placeholder="'Host Name'"
                block
              />
            </template>
          </p-field-group>
          <p-field-group
            :invalid="!loadConfigModel.inputModels.port.isValid"
            :label="'Port'"
            required
          >
            <template #default="{ invalid }">
              <p-text-input
                v-model="loadConfigModel.inputModels.port.value"
                :invalid="invalid"
                :type="'number'"
                :placeholder="'1~65535'"
                block
              />
            </template>
          </p-field-group>
          <p-field-group
            :invalid="!loadConfigModel.inputModels.path.isValid"
            :label="'URI'"
            required
          >
            <template #default="{ invalid }">
              <div class="flex gap-1">
                <p-select-dropdown
                  class="flex-1"
                  :menu="loadConfigModel.protocol.menu"
                  :selected="loadConfigModel.protocol.selected"
                  :placeholder="'Protocol'"
                  @select="e => (loadConfigModel.protocol.selected = e)"
                />
                <p-text-input
                  v-model="loadConfigModel.inputModels.path.value"
                  :invalid="invalid"
                  class="flex-2"
                  :placeholder="'Path'"
                  block
                />
              </div>
            </template>
          </p-field-group>
          <p-field-group :label="'Method'" required>
            <template #default="{ invalid }">
              <p-select-dropdown
                class="block"
                :menu="loadConfigModel.methods.menu"
                :selected="loadConfigModel.methods.selected"
                :placeholder="'Method'"
                @select="e => (loadConfigModel.methods.selected = e)"
              />
            </template>
          </p-field-group>
          <p-field-group class="!m-0" :label="'Body Data'">
            <template #default="{ invalid }">
              <p-textarea
                v-model="loadConfigModel.inputModels.bodyData.value"
                class="min-h-12"
                :placeholder="'Copy and Paste the data.'"
              />
            </template>
          </p-field-group>
        </section>
        <section class="section">
          <p-field-group label="Load Template">
            <template #default="{ invalid }">
              <p-select-dropdown
                v-model="selectedTemplate"
                :menu="
                  savedTemplates.map(template => ({
                    name: template.name,
                    label: template.name,
                  }))
                "
                placeholder="Choose a saved template"
                block
                @select="applyTemplate"
              />
            </template>
          </p-field-group>
          <p-field-group
            :invalid="!loadConfigModel.inputModels.virtualUsers.isValid"
            :label="'Virtual Users'"
            required
          >
            <template #default="{ invalid }">
              <p-text-input
                v-model="loadConfigModel.inputModels.virtualUsers.value"
                :invalid="invalid"
                :type="'number'"
                :placeholder="'Number of virtual users'"
                block
              />
            </template>
          </p-field-group>
          <p-field-group
            :invalid="!loadConfigModel.inputModels.testDuration.isValid"
            :label="'Test Duration'"
            required
          >
            <template #default="{ invalid }">
              <p-text-input
                v-model="loadConfigModel.inputModels.testDuration.value"
                :invalid="invalid"
                :type="'number'"
                :placeholder="'Test Run Time'"
                block
              >
                <template #input-right>sec</template>
              </p-text-input>
            </template>
          </p-field-group>
          <div class="flex gap-1">
            <p-field-group
              :invalid="!loadConfigModel.inputModels.rampUpTime.isValid"
              class="flex-1 !m-0"
              :label="'RampUp Time'"
              required
            >
              <template #default="{ invalid }">
                <p-text-input
                  v-model="loadConfigModel.inputModels.rampUpTime.value"
                  :invalid="invalid"
                  :placeholder="'Time'"
                  :type="'number'"
                  block
                />
              </template>
            </p-field-group>
            <p-field-group
              :invalid="!loadConfigModel.inputModels.rampUpSteps.isValid"
              class="flex-1 !m-0"
              :label="'RampUp Steps'"
              required
            >
              <template #default="{ invalid }">
                <p-text-input
                  v-model="loadConfigModel.inputModels.rampUpSteps.value"
                  :invalid="invalid"
                  :placeholder="'Number of steps'"
                  :type="'number'"
                  block
                />
              </template>
            </p-field-group>
          </div>
        </section>
        <section class="section">
          <p-field-group class="!m-0" :label="'Install Location'" required>
            <template #default>
              <p-radio-group>
                <p-radio
                  v-for="value in loadConfigModel.location.values"
                  :key="value.key"
                  v-model="loadConfigModel.location.selected"
                  :value="value.key"
                >
                  {{ value.label }}
                </p-radio>
              </p-radio-group>
            </template>
          </p-field-group>
        </section>
        <section class="section">
          <div class="flex gap-2">
            <p-toggle-button
              :value="loadConfigModel.isMetrics.value"
              @update:value="e => (loadConfigModel.isMetrics.value = e)"
            />
            <p>Collect Additional System Metrics</p>
          </div>
          <p-divider class="mt-2 mb-2" />
          <div class="flex w-full gap-1">
            <p-field-group
              :invalid="!loadConfigModel.inputModels.agentHostName.isValid"
              class="!m-0 flex-2"
              :label="'Agent Hostname'"
            >
              <template #default="{ invalid }">
                <p-text-input
                  v-model="loadConfigModel.inputModels.agentHostName.value"
                  :invalid="invalid"
                  :placeholder="'Agent Host Name'"
                  block
                />
              </template>
            </p-field-group>
            <p-field-group
              class="!m-0 flex-1"
              :label="'Agent Hostname'"
              required
            >
              <template #default="{ invalid }">
                <p-select-dropdown
                  class="block"
                  :menu="loadConfigModel.installed.menu"
                  :selected="loadConfigModel.installed.selected"
                  :placeholder="'select'"
                  @select="e => (loadConfigModel.installed.selected = e)"
                />
              </template>
            </p-field-group>
          </div>
        </section>
      </div>
    </template>
  </PButtonModal>
</template>

<style scoped lang="postcss">
.config-form {
  @apply bg-gray-100;
  padding: 16px;

  .section {
    background: white;
    margin: 8px 0 8px 0;
    padding: 12px;
    border-radius: 6px;
  }
}
</style>
