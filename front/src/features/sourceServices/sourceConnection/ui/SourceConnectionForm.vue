<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { reactive, watchEffect, computed } from 'vue';

interface ConnectionInfo {
  id?: string;
  name: string;
  description?: string;
  ip_address: string;
  user: string;
  private_key?: string;
  ssh_port: string | number;
  password?: string;
}

interface Props {
  modelValue?: ConnectionInfo;
  mode?: 'create' | 'edit';
  showDeleteButton?: boolean;
  readonly?: string[]; // readonly로 만들 필드 목록
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  showDeleteButton: false,
  readonly: () => [],
  modelValue: () => ({
    name: '',
    description: '',
    ip_address: '',
    user: '',
    private_key: '',
    ssh_port: '22',
    password: '',
  }),
});

const emit = defineEmits<{
  'update:modelValue': [value: ConnectionInfo];
  delete: [];
  'update:valid': [valid: boolean];
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
});

// 공통 Validation 로직
watchEffect(() => {
  invalidState.isIpAddressValid =
    localValue.value.ip_address === '' ||
    !localValue.value.ip_address.match(/^(\d{1,3}\.){3}\d{1,3}$/)
      ? false
      : true;

  if (typeof Number(localValue.value.ssh_port) === 'number') {
    invalidState.isPortValid =
      Number(localValue.value.ssh_port) > 0 &&
      Number(localValue.value.ssh_port) < 65535
        ? true
        : false;
  }
  
  // 전체 validation 상태를 parent에 emit
  const isValid = 
    localValue.value.name &&
    invalidState.isIpAddressValid &&
    invalidState.isPortValid &&
    localValue.value.user &&
    (localValue.value.password || localValue.value.private_key);
    
  emit('update:valid', !!isValid);
});

const isFieldReadonly = (fieldName: string) => {
  return props.readonly.includes(fieldName);
};

const handleDelete = () => {
  emit('delete');
};
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" invalid required>
          <p-text-input
            v-model="localValue.name"
            placeholder="Source Connection Name"
            :invalid="!localValue.name"
            :disabled="isFieldReadonly('name')"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea
            v-model="localValue.description"
            :disabled="isFieldReadonly('description')"
          />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address" invalid required>
          <p-text-input
            v-model="localValue.ip_address"
            :invalid="!invalidState.isIpAddressValid"
            placeholder="###.###.###.###"
            :disabled="isFieldReadonly('ip_address')"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)" invalid required>
          <p-text-input
            v-model="localValue.ssh_port"
            placeholder="1~65535"
            :invalid="!invalidState.isPortValid"
            :disabled="isFieldReadonly('ssh_port')"
          />
        </p-field-group>
        <p-field-group label="User" invalid required>
          <p-text-input
            v-model="localValue.user"
            placeholder="User ID"
            :invalid="!localValue.user"
            :disabled="isFieldReadonly('user')"
          />
        </p-field-group>
        <p-field-group label="Password">
          <p-text-input
            v-model="localValue.password"
            placeholder="Password"
            :disabled="isFieldReadonly('password')"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key">
          <p-textarea
            v-model="localValue.private_key"
            :rows="5"
            :disabled="isFieldReadonly('private_key')"
          />
        </p-field-group>
      </div>
    </p-pane-layout>
    <button v-if="showDeleteButton" @click="handleDelete">
      <p-i name="ic_close" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.source-connection-layout {
  @apply flex mb-[1rem];
}
.source-connection-info {
  @apply flex p-[1.5rem] border-[0.0625rem] border-[#DDDDDF];
  width: 100%;
  min-height: 15.125rem;
  border-radius: 0.25rem 0 0 0.25rem;
  .left-layer {
    .p-text-input {
      @apply w-[450px];
    }
  }
  .right-layer {
    @apply grid grid-cols-2 gap-x-[1.5rem] ml-[1.5rem];
    .private-key {
      @apply col-span-2;
      .p-textarea {
        @apply w-full;
      }
    }
  }
}

button {
  @apply bg-[#EDEDEF] w-[2.5rem];
}

:deep(.p-text-input) {
  @apply w-[19.25rem];
}
</style>

