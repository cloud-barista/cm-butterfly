<script setup lang="ts">
import { PButton, PIconButton, PBadge } from '@cloudforet-test/mirinae';
import { WidgetLayout } from '@/widgets/layout';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sidebar = useSidebar();
const sourceConnectionStore = useSourceConnectionStore();

const { isCollapsed, isGnbToolboxShown, isMinimized } = storeToRefs(sidebar);

interface Props {
  title: string;
  badgeTitle?: string;
  firstTitle?: string;
  subtitle?: string;
  addButtonText?: string;
}

defineProps<Props>();
const emit = defineEmits([
  'addSourceConnection',
  'deleteSourceConnection',
  'update:is-connection-modal-opened',
  'update:is-service-modal-opened',
  'update:is-meta-viewer-opened',
  // TODO: 이 위로 모두 없애기
  'update:modal-state',
  'on-click:button',
]);

const handleAddSourceConnection = () => {
  emit('addSourceConnection', true);
  // 이 위로 모두 없애기
};

// TODO: change api response

const isServiceModalOpened = ref<boolean>(true);

const handleGoBack = () => {
  emit('deleteSourceConnection', true);
  emit('update:is-connection-modal-opened', false);
  emit('update:is-service-modal-opened', isServiceModalOpened.value);
  emit('update:is-meta-viewer-opened', false);
  isCollapsed.value = false;
  isGnbToolboxShown.value = true;
  isMinimized.value = false;
  sourceConnectionStore.setWithSourceConnection(true);

  // 이 위로 모두 없애기
  emit('update:modal-state');
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
      <p class="page-title">{{ title }}</p>
      <p-badge
        v-if="badgeTitle"
        class="badge"
        shape="square"
        style-type="primary1"
        text-color="#6738b7"
        background-color="#E1E0FA"
        font-weight="regular"
      >
        <div>{{ badgeTitle }}</div>
      </p-badge>
    </div>
    <widget-layout
      class="widget-layout"
      overflow="visible"
      :first-title="firstTitle"
      :title="subtitle"
    >
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
    @apply flex gap-[0.75rem] items-center;
    margin-bottom: 1.375rem;
    .badge {
      max-height: 20px;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
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
