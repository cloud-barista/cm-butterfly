<script setup lang="ts">
import { PDataLoader, PButton, PEmpty } from '@cloudforet-test/mirinae';
import { reactive } from 'vue';

const props = withDefaults(
  defineProps<{
    visible?: boolean;
    count?: number;
  }>(),
  {
    visible: false,
    count: 0,
  },
);

const state = reactive({
  loading: true,
  items: [],
});
</script>

<template>
  <div class="top-bar-notifications-context-menu">
    <p-data-loader
      :data="state.items"
      :loading="state.loading"
      :disable-empty-case="state.loading"
    >
      <div
        ref="notificationItemsRef"
        class="content-wrapper"
        :class="{ loading: state.loading }"
      >
        <p-button>Here</p-button>
      </div>
      <template #no-data>
        <p-empty show-image title="No Notifications">
          <!-- <template #image>
            <img  alt="">
          </template> -->
        </p-empty>
      </template>
      When you get notifications, they’ll show up here.
    </p-data-loader>
  </div>
</template>

<style scoped lang="postcss">
.top-bar-notifications-context-menu {
  @apply bg-white;
  display: flex;
  flex-direction: column;
  min-height: 13rem;

  /* custom design-system component - p-link */
  .detail-link:deep {
    > a {
      display: inline;
    }
  }

  /* custom design-system component - p-data-loader */
  :deep(.p-data-loader) {
    &.loading {
      height: 13rem;
    }
    .data-loader-container {
      .no-data-wrapper {
        max-height: inherit;
      }
    }
  }
  .content-wrapper {
    &.loading {
      min-height: 13rem;
    }
    max-height: calc(100vh - $top-bar-height - 1.5rem);
    position: relative;
    overflow-y: auto;
    padding: 0.25rem 0.5rem 0.5rem 0.5rem;

    .clear-all-button {
      position: absolute;
      top: 0.75rem;
      right: 0.5rem;
    }
  }
  .notification-modal {
    .header-wrapper {
      display: flex;
      align-items: flex-start;
      font-size: 1.375rem;
      line-height: 1.25;
      margin-bottom: 1rem;
      .icon {
        min-width: 1.5rem;
        margin-right: 0.5rem;
        margin-top: 0.25rem;
      }
    }
    .meta-data-wrapper {
      display: grid;
      gap: 0.25rem;
      font-size: 12px;
      line-height: 1.25;
      margin-bottom: 1.375rem;
    }
    .description-wrapper {
      @apply bg-violet-100;
      font-size: 0.875rem;
      line-height: 1.5;
      padding: 0.75rem 1rem;
      margin-bottom: 0.75rem;
      white-space: pre-line;
    }
  }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
  text-align: center;
  padding: 4rem 3.25rem;
}
</style>
