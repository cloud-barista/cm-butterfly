<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useCredentialsStore } from '@/entities/credentials/model/stores.ts';
import { showSuccessMessage } from '@/shared/utils';

export default defineComponent({
  name: 'EditCredentialModal',
  props: {
    selectedCredentialId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:is-credential-modal-opened', 'update:trigger'],
  setup(props, { emit }) {
    const credentialsStore = useCredentialsStore();
    const credential = ref<any>(null);
    const name = ref('');
    const type = ref('');

    watch(
      () => props.selectedCredentialId,
      newId => {
        if (newId) {
          credential.value = credentialsStore.getCredentialById(newId);
          if (credential.value) {
            name.value = credential.value.name;
            type.value = credential.value.type;
          }
        }
      },
      { immediate: true },
    );

    const editCredential = () => {
      if (credential.value) {
        credentialsStore.updateCredential(props.selectedCredentialId, {
          name: name.value,
          type: type.value,
        });
        emit('update:trigger', true);
        emit('update:is-credential-modal-opened', false);
        showSuccessMessage('success', 'Credential updated successfully');
      }
    };

    const closeModal = () => {
      emit('update:is-credential-modal-opened', false);
    };

    return {
      name,
      type,
      editCredential,
      closeModal,
    };
  },
});
</script>

<template>
  <div class="modal">
    <h2>Edit Credential</h2>
    <form @submit.prevent="editCredential">
      <label for="name">Name:</label>
      <input id="name" v-model="name" required />

      <label for="type">Type:</label>
      <input id="type" v-model="type" required />

      <button type="submit">Save</button>
      <button type="button" @click="closeModal">Cancel</button>
    </form>
  </div>
</template>

<style scoped>
.modal {
  /* 모달 스타일 추가 */
}
</style>
