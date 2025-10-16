<template>
  <div class="field-group flex border-bottom">
    <div class="section-title" @click="$emit('toggle')">
      <PIconButton
        :class="expanded && 'accordion-isOpen'"
        :name="expanded ? 'ic_chevron_down' : 'ic_chevron_right'"
        :size="'sm'"
      />
      <span class="section-label">{{ label }}</span>
      <span class="section-count">({{ itemCount }})</span>
    </div>
    <div class="field-content-box">
      <p-button
        v-if="type === 'array'"
        :style-type="'secondary'"
        icon-left="ic_plus"
        :size="'sm'"
        @click="$emit('add-item')"
      >
        Add Object
      </p-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PButton, PIconButton } from '@cloudforet-test/mirinae';

export default defineComponent({
  name: 'SectionHeader',
  components: {
    PButton,
    PIconButton
  },
  props: {
    label: {
      type: String,
      required: true
    },
    type: {
      type: String as () => 'object' | 'array',
      required: true
    },
    expanded: {
      type: Boolean,
      default: false
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['toggle', 'add-item']
});
</script>

<style scoped>
.field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.section-title {
  @apply flex items-center space-x-2 cursor-pointer;
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

.section-label {
  @apply font-medium text-gray-700;
}

.section-count {
  @apply text-sm text-gray-500;
}
</style>
