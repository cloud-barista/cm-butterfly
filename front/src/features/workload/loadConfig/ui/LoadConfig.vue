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
import { i18n } from '@/app/i18n';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useLoadConfigModel } from '@/features/workload/loadConfig/model';

interface IProps {
  isOpen: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['close']);

const userId = useInputModel<string>('');
const loadConfigModel = useLoadConfigModel();

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
    @confirm="handelClose"
    @cancel="handelClose"
    @close="handelClose"
  >
    <template #body>
      <div class="config-form">
        <div class="title">
          <p-field-group :label="'Test Scenario Name'" required>
            <template #default="{ invalid }">
              <p-text-input
                v-model="userId.value.value"
                :placeholder="'Test Scenario Name'"
                block
                @blur="userId.onBlur"
              />
            </template>
          </p-field-group>
        </div>

        <section class="section">
          <p-field-group :label="'Target Host Name'" required>
            <template #default="{ invalid }">
              <p-text-input
                v-model="userId.value.value"
                :placeholder="'Host Name'"
                block
                @blur="userId.onBlur"
              />
            </template>
          </p-field-group>
          <p-field-group :label="'Port'" required>
            <template #default="{ invalid }">
              <p-text-input
                v-model="userId.value.value"
                :placeholder="'1~65535'"
                block
                @blur="userId.onBlur"
              />
            </template>
          </p-field-group>
          <p-field-group :label="'URI'" required>
            <template #default="{ invalid }">
              <div class="flex gap-1">
                <p-select-dropdown
                  class="flex-1"
                  :menu="loadConfigModel.protocol.menu"
                  :placeholder="'Protocol'"
                ></p-select-dropdown>
                <p-text-input
                  class="flex-2"
                  v-model="userId.value.value"
                  :placeholder="'Path'"
                  block
                  @blur="userId.onBlur"
                />
              </div>
            </template>
          </p-field-group>
          <p-field-group :label="'Method'" required>
            <template #default="{ invalid }">
              <p-select-dropdown
                class="block"
                :menu="loadConfigModel.methods.menu"
                :placeholder="'Method'"
              ></p-select-dropdown>
            </template>
          </p-field-group>
          <p-field-group class="!m-0" :label="'Body Data'">
            <template #default="{ invalid }">
              <p-textarea
                class="min-h-12"
                v-model="userId.value.value"
                :placeholder="'Copy and Paste the data.'"
                @blur="userId.onBlur"
              />
            </template>
          </p-field-group>
        </section>
        <section class="section">
          <p-field-group :label="'Virtual Users'" required>
            <template #default="{ invalid }">
              <p-text-input
                v-model="userId.value.value"
                :placeholder="'Number of virtual users'"
                block
                @blur="userId.onBlur"
              />
            </template>
          </p-field-group>
          <p-field-group :label="'Test Duration'" required>
            <template #default="{ invalid }">
              <p-text-input
                v-model="userId.value.value"
                :placeholder="'Test Run Time'"
                block
                @blur="userId.onBlur"
              >
                <template #input-right>sec</template>
              </p-text-input>
            </template>
          </p-field-group>
          <div class="flex w-full gap-1">
            <p-field-group class="flex-1 !m-0" :label="'RampUp Time'" required>
              <template #default="{ invalid }">
                <p-text-input
                  v-model="userId.value.value"
                  :placeholder="'Time'"
                  block
                  @blur="userId.onBlur"
                >
                  <template #input-right>sec</template>
                </p-text-input>
              </template>
            </p-field-group>
            <p-field-group class="flex-1 !m-0" :label="'RampUp Steps'" required>
              <template #default="{ invalid }">
                <p-text-input
                  v-model="userId.value.value"
                  :placeholder="'Number of steps'"
                  block
                  @blur="userId.onBlur"
                />
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
                  :value="value"
                >
                  {{ value.label }}
                </p-radio>
              </p-radio-group>
            </template>
          </p-field-group>
        </section>
        <section class="section">
          <div class="flex gap-2">
            <p-toggle-button :value="loadConfigModel.isMetrics.value">
            </p-toggle-button>
            <p>Collect Additional System Metrics</p>
          </div>
          <p-divider class="mt-2 mb-2"></p-divider>
          <div class="flex w-full gap-1">
            <p-field-group class="!m-0 flex-2" :label="'Agent Hostname'">
              <template #default="{ invalid }">
                <p-text-input
                  v-model="userId.value.value"
                  :placeholder="'Agent Host Name'"
                  block
                  @blur="userId.onBlur"
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
                  :placeholder="'select'"
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
