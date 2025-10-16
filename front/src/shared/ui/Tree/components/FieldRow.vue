<template>
  <div class="field-row-container">
    <div class="field-title-box">
      {{ label }}
    </div>
    <div class="field-content-box">
      <input
        :value="value"
        class="field-input"
        @input="handleInput"
      />
      <button v-if="deletable" class="delete-btn" @click="$emit('delete')">
        ×
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FieldRow',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number, Boolean],
      required: true
    },
    deletable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update', 'delete'],
  methods: {
    handleInput(event: Event) {
      this.$emit('update', event);
    }
  }
});
</script>

<style scoped>
.field-row-container {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.field-title-box {
  display: flex;
  align-items: center;
  width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.field-content-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 310px;
  height: 44px;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.field-input {
  @apply w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500;
  border-radius: 4px;
}

.delete-btn {
  @apply w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-100 ml-2;
  border-radius: 4px;
}
</style>
