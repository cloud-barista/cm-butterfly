<script setup lang="ts">
import { PButton, PIconButton } from '@cloudforet-test/mirinae';
import { WidgetLayout } from '@/widgets/layout';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';

const sidebar = useSidebar();

const { isCollapsed, isGnbToolboxShown, isMinimized } = storeToRefs(sidebar);

interface Props {
  title: string;
  subtitle?: string;
  addButtonText?: string;
}

defineProps<Props>();
const emit = defineEmits([
  'addSourceConnection',
  'deleteSourceConnection',
  'update:is-connection-modal-opened',
  'update:is-service-modal-opened',
]);

const handleAddSourceConnection = () => {
  emit('addSourceConnection', true);
};

// TODO: change api response

const handleGoBack = () => {
  emit('deleteSourceConnection', false); //TODO: true로 바꿔야함. 임시...
  emit('update:is-connection-modal-opened', false);
  emit('update:is-service-modal-opened', false);
  isCollapsed.value = false;
  isGnbToolboxShown.value = true;
  isMinimized.value = true;
};
</script>

<template>
  <div class="page-layer">
    <div class="page-top">
      <p-icon-button
        style-type="transparent"
        name="ic_arrow-left"
        width="2rem"
        height="2rem"
        @click="handleGoBack"
      />
      <p>{{ title }}</p>
    </div>
    <widget-layout class="widget-layout" :title="subtitle" overflow="auto">
      <template #default>
        <p-button
          v-if="addButtonText"
          class="icon-plus"
          icon-left="ic_plus"
          style-type="secondary"
          @click="handleAddSourceConnection"
        >
          {{ addButtonText }}
        </p-button>
        <slot name="add-info" />
      </template>
    </widget-layout>
    <div class="action-buttons">
      <slot name="buttons" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.page-layer {
  @apply p-[1.5rem];
  .page-top {
    @apply flex gap-[0.75rem];
    p {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.375rem;
    }
    .go-back {
      cursor: pointer;
    }
  }
}

.widget-layout {
  min-height: 45.25rem;
  .icon-plus {
    @apply mb-[1.5rem];
  }
  .list {
    .title-wrapper {
      @apply flex gap-[9.25rem] mb-[1rem];
      .title {
        font-size: 1rem;
        font-weight: 700;
      }
    }
  }
}

.input-wrapper {
  @apply flex gap-[1rem];
  .icon-close {
    margin-top: 4px;
  }
}

.action-buttons {
  @apply flex justify-end gap-[1rem] mt-[1.5rem];
}
</style>
