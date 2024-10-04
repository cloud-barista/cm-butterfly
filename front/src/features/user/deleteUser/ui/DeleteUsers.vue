<script setup>
import { PIconButton } from '@cloudforet-test/mirinae';

const props = defineProps({
  label: String,
  focus: Boolean,
});

const emit = defineEmits(['button-click']);
</script>

<template>
  <div class="tool">
    <p v-if="focus">{{ props.label }}</p>
    <p-icon-button
      name="ic_delete"
      @click="$emit('button-click', 'Button was clicked!')"
    >
    </p-icon-button>
  </div>
</template>
