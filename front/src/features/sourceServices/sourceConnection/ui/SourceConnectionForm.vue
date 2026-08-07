<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { computed, reactive, watchEffect } from 'vue';
// Import from the shared module so it follows the same rules as the import path.
import {
  isFilled,
  isIpValid,
  isPortValid,
  CREDENTIAL_HINT,
} from '@/shared/utils/connectionValidation';

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
  sourceConnection?: ConnectionInfo;
  mode?: 'create' | 'edit';
  showDeleteButton?: boolean;
  readonly?: string[]; // list of fields to make readonly
  // When editing an already-registered connection, these are the values stored
  // on the server. They're only shown as placeholders (the inputs aren't filled),
  // so they're never used in the payload.
  existing?: Partial<ConnectionInfo> | null;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  showDeleteButton: false,
  readonly: () => [],
  existing: null,
  sourceConnection: () => ({
    name: '',
    description: '',
    ip_address: '',
    user: '',
    private_key: '',
    ssh_port: '22',
    password: '',
  }),
});

const emit = defineEmits(['delete']);

// Whether this is editing an already-registered connection. In that case the
// inputs open empty, and only the fields the user actually types are validated
// and sent. Fields left blank keep their existing values.
const isExistingEdit = computed(
  () => props.mode === 'edit' && !!props.existing,
);

const KEEP_HINT = 'Leave blank to keep the current value';

const placeholderFor = (field: keyof ConnectionInfo, fallback: string) => {
  if (!isExistingEdit.value) return fallback;
  const current = props.existing?.[field];
  // Credential fields come down encrypted from the server, so there's no plaintext to show.
  return current !== undefined && current !== null && current !== ''
    ? String(current)
    : KEEP_HINT;
};

const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
});

// Only what this form shows. Whether the whole screen can be saved is decided by
// the screen holding the rows, with `isConnectionRowValid` over each of them —
// this form used to report its own answer from inside this watcher, and the
// handler receiving it ran within the watcher's tracking scope, which tied every
// form on screen to the collected result.
watchEffect(() => {
  const conn = props.sourceConnection;
  if (!conn) return;

  invalidState.isIpAddressValid =
    isFilled(conn.ip_address) && isIpValid(conn.ip_address);
  invalidState.isPortValid =
    isFilled(conn.ssh_port) && isPortValid(conn.ssh_port);
});

// So untouched fields don't turn red, only show an error when a value is present.
const showIpError = computed(
  () =>
    (isExistingEdit.value
      ? isFilled(props.sourceConnection?.ip_address)
      : true) && !invalidState.isIpAddressValid,
);

const showPortError = computed(
  () =>
    (isExistingEdit.value
      ? isFilled(props.sourceConnection?.ssh_port)
      : true) && !invalidState.isPortValid,
);

const showNameError = computed(
  () => !isExistingEdit.value && !isFilled(props.sourceConnection?.name),
);

const showUserError = computed(
  () => !isExistingEdit.value && !isFilled(props.sourceConnection?.user),
);

// Case where the credential combination isn't valid for a new registration.
// The server rejects a password without a username, or a private key without a username.
const showCredentialError = computed(
  () =>
    !isExistingEdit.value &&
    !(
      isFilled(props.sourceConnection?.password) ||
      isFilled(props.sourceConnection?.private_key)
    ),
);

const isFieldReadonly = (fieldName: string) => {
  return props.readonly.includes(fieldName);
};

const handleDelete = () => {
  emit('delete');
};
</script>

<template>
  <div class="source-connection-layout" data-testid="source-connection-row">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group
          label="Source Connection Name"
          :invalid="showNameError"
          :required="!isExistingEdit"
        >
          <p-text-input
            v-model="sourceConnection.name"
            data-testid="source-connection-name"
            :placeholder="placeholderFor('name', 'Source Connection Name')"
            :invalid="showNameError"
            :disabled="isFieldReadonly('name')"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea
            v-model="sourceConnection.description"
            data-testid="source-connection-description"
            :placeholder="placeholderFor('description', '')"
            :disabled="isFieldReadonly('description')"
          />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group
          label="IP Address"
          :invalid="showIpError"
          :required="!isExistingEdit"
        >
          <p-text-input
            v-model="sourceConnection.ip_address"
            data-testid="source-connection-ip"
            :invalid="showIpError"
            :placeholder="placeholderFor('ip_address', '###.###.###.###')"
            :disabled="isFieldReadonly('ip_address')"
          />
        </p-field-group>
        <p-field-group
          label="Port (for SSH)"
          :invalid="showPortError"
          :required="!isExistingEdit"
        >
          <p-text-input
            v-model="sourceConnection.ssh_port"
            data-testid="source-connection-ssh-port"
            :placeholder="placeholderFor('ssh_port', '1~65535')"
            :invalid="showPortError"
            :disabled="isFieldReadonly('ssh_port')"
          />
        </p-field-group>
        <p-field-group
          label="User"
          :invalid="showUserError"
          :required="!isExistingEdit"
        >
          <p-text-input
            v-model="sourceConnection.user"
            data-testid="source-connection-user"
            :placeholder="isExistingEdit ? KEEP_HINT : 'User ID'"
            :invalid="showUserError"
            :disabled="isFieldReadonly('user')"
          />
        </p-field-group>
        <p-field-group
          label="Password"
          :invalid="showCredentialError"
          :invalid-text="showCredentialError ? CREDENTIAL_HINT : ''"
        >
          <p-text-input
            v-model="sourceConnection.password"
            data-testid="source-connection-password"
            :placeholder="isExistingEdit ? KEEP_HINT : 'Password'"
            :invalid="showCredentialError"
            :disabled="isFieldReadonly('password')"
          />
        </p-field-group>
        <p-field-group
          class="private-key"
          label="Private Key"
          :invalid="showCredentialError"
        >
          <p-textarea
            v-model="sourceConnection.private_key"
            data-testid="source-connection-private-key"
            :placeholder="isExistingEdit ? KEEP_HINT : ''"
            :rows="5"
            :disabled="isFieldReadonly('private_key')"
          />
        </p-field-group>
      </div>
    </p-pane-layout>
    <button
      v-if="showDeleteButton"
      data-testid="source-connection-remove-row"
      @click="handleDelete"
    >
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
