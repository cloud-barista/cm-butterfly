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
import { watch } from 'vue';
import { showErrorMessage } from '@/shared/utils';
import { useRunLoadTest } from '@/entities/vm/api/api';

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
watch(
  () => props.ip,
  () => {
    loadConfigModel.inputModels.agentHostName.value = props.ip;
    loadConfigModel.inputModels.targetHostName.value = props.ip;
  },
  { immediate: true },
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
  emit('close');
}
</script>

<template>
  <PButtonModal
    :visible="isOpen"
    :v-model="isOpen"
    size="sm"
    :loading="false"
    headerTitle="Load Config"
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
                :invalid="invalid"
                v-model="loadConfigModel.inputModels.scenarioName.value"
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
                :invalid="invalid"
                v-model="loadConfigModel.inputModels.targetHostName.value"
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
                :invalid="invalid"
                v-model="loadConfigModel.inputModels.port.value"
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
                ></p-select-dropdown>
                <p-text-input
                  :invalid="invalid"
                  class="flex-2"
                  v-model="loadConfigModel.inputModels.path.value"
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
              ></p-select-dropdown>
            </template>
          </p-field-group>
          <p-field-group class="!m-0" :label="'Body Data'">
            <template #default="{ invalid }">
              <p-textarea
                class="min-h-12"
                v-model="loadConfigModel.inputModels.bodyData.value"
                :placeholder="'Copy and Paste the data.'"
              />
            </template>
          </p-field-group>
        </section>
        <section class="section">
          <p-field-group
            :invalid="!loadConfigModel.inputModels.virtualUsers.isValid"
            :label="'Virtual Users'"
            required
          >
            <template #default="{ invalid }">
              <p-text-input
                :invalid="invalid"
                v-model="loadConfigModel.inputModels.virtualUsers.value"
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
                :invalid="invalid"
                v-model="loadConfigModel.inputModels.testDuration.value"
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
                  :invalid="invalid"
                  v-model="loadConfigModel.inputModels.rampUpTime.value"
                  :placeholder="'Time'"
                  :type="'number'"
                  block
                >
                </p-text-input>
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
                  :invalid="invalid"
                  v-model="loadConfigModel.inputModels.rampUpSteps.value"
                  :placeholder="'Number of steps'"
                  :type="'number'"
                  block
                >
                </p-text-input>
              </template>
            </p-field-group>
          </div>
        </section>
        <section class="section">
          <p-field-group class="!m-0" :label="'Install Location'" required>
            <template #default="{ invalid }">
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
            >
            </p-toggle-button>
            <p>Collect Additional System Metrics</p>
          </div>
          <p-divider class="mt-2 mb-2"></p-divider>
          <div class="flex w-full gap-1">
            <p-field-group
              :invalid="!loadConfigModel.inputModels.agentHostName.isValid"
              class="!m-0 flex-2"
              :label="'Agent Hostname'"
            >
              <template #default="{ invalid }">
                <p-text-input
                  :invalid="invalid"
                  v-model="loadConfigModel.inputModels.agentHostName.value"
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
                ></p-select-dropdown>
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
