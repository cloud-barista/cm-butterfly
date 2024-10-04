<script setup lang="ts">
import {
  PSelectDropdown,
  PTooltip,
  PI,
  PEmpty,
} from '@cloudforet-test/mirinae';
import { gray, violet } from '@/app/style/colors';
import { reactive, ref, watch } from 'vue';

import { i18n } from '@/app/i18n';
const CONTEXT_MENU_TYPE = {
  divider: 'divider',
  header: 'header',
  item: 'item',
  button: 'button',
  showMore: 'showMore',
};

const selectDropdownRef = ref<PSelectDropdown | null>(null);

watch(
  () => selectDropdownRef,
  async () => {
    if (!selectDropdownRef.value) return;
    await selectDropdownRef.value.reloadMenu();
  },
);

const state = reactive({
  searchText: 'searchText Ex',
});

const opened = ref(false);

const workspaceList = [
  {
    name: 'f4123777-5d4b-4740-84bd-75217ed02da8',
    label: 'RAM',
    type: 'item',
    headerName: 'item',
  },
  {
    name: '0536ff35-a63e-41e3-aec0-ebb57ba96af3',
    label: 'Keyboard',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: 'e8b77438-bd54-4b6e-8c2f-3fb1acdc4d28',
    label: 'reintermediate',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: '9fa94169-0184-403a-92fc-16f64682f8bc',
    label: 'Legacy',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: 'c64cd1d5-4fa8-4bcf-908b-60d3ed55db23',
    label: 'Tasty',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: '7ae972f6-b2aa-4e86-a8e1-b6fc73ffaa52',
    label: 'Profound',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: 'ccfcdd1f-18de-4e10-9e75-51477f9b278e',
    label: 'monitor',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: 'b2c20d0a-13cd-422d-b643-aab3486bc7ef',
    label: 'Music',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: '3660e8ca-f6f2-4502-9a4f-105eb8fda317',
    label: 'models',
    type: 'item',
    headerName: 'Tuna',
  },
  {
    name: 'Concrete',
    label: 'disintermediate',
    type: 'header',
  },
  {
    name: '16179e29-2a67-4175-97bb-e94220c4c92c',
    label: 'Belgium',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: 'b9305238-9e7e-44ea-ab6f-745867ef4d60',
    label: 'Oriental',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: 'ff0900d3-376a-4c9c-952a-f068b64c5fb9',
    label: 'revolutionary',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: '0935d7e0-9a60-4648-bdae-23cadb0b413b',
    label: 'Bronze',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: '76e1eeaa-8064-4989-af29-fa2fcad820e5',
    label: 'Sum',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: 'b0bd6789-dbe1-44a5-851f-3f11954d3abc',
    label: 'generate',
    type: 'item',
    headerName: 'Concrete',
  },
  {
    name: '9300c6d8-6877-4f3e-9947-a176621e8f6e',
    label: 'product',
    type: 'item',
    headerName: 'Concrete',
  },
];

const formatMenuItems = (menuItems: any[]) => {
  const result =
    menuItems.length > 0
      ? [
          {
            type: CONTEXT_MENU_TYPE.header,
            name: 'workspace_header',
            label: `${i18n.t('WORKSPACE._NAME')}`,
          },
        ]
      : ([] as any[]);
  menuItems.forEach(item => {
    result.push({
      ...item,
      type: CONTEXT_MENU_TYPE.item,
      name: item.workspace_id || '',
      label: item.name as string,
    });
  });
  return result.slice(0, 2);
};

const menuHandler = async (inputText: string) => {
  opened.value = true;
  inputText = 'Tuna';
  const _workspaceList = workspaceList.filter(w =>
    w.name.toLowerCase()?.includes(inputText.toLowerCase()),
  );
  return {
    results: inputText
      ? formatMenuItems(_workspaceList)
      : [...formatMenuItems(_workspaceList)],
  };
};

// const selectedWorkspace = ref(
//   menuItems.filter(d => !d.type || d.type === 'item').slice(0, 2),
// );

const selectWorkspace = (name: string) => {
  const workspaceId = name;
  if (!workspaceId || workspaceId === 'storeState.currentWorkspaceId') return;
};

// const selectWorkspace = (name: string): void => {
//     const workspaceId = name;
//     if (!workspaceId || workspaceId === storeState.currentWorkspaceId) return;

//     appContextStore.setGlobalGrantLoading(true);
//     const reversedMatched = clone(router.currentRoute.matched).reverse();
//     const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
//     const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
//     userWorkspaceStore.setCurrentWorkspace(workspaceId);
//     router.push({ name: MENU_INFO_MAP[targetMenuId].routeName, params: { workspaceId } }).catch(() => {});
// };
</script>

<template>
  <div class="top-bar-header" data-gtm="gtm-top-bar-logo">
    <!-- ref="selectDropdownRef"
        :class="{ 'workspace-dropdown': true }" -->
    <!-- <p-select-dropdown :menu="menu" :page-size="5"> -->
    <p-select-dropdown
      ref="selectDropdownRef"
      :class="{ 'workspace-dropdown': true }"
      style-type="transparent"
      :handler="menuHandler"
      :search-text.sync="state.searchText"
      is-filterable
      hide-header-without-items
      show-delete-all-button
    >
      <template #dropdown-button-icon>
        <p-i
          name="ic_chevron-sort"
          width="1rem"
          height="1rem"
          :color="gray[800]"
        />
      </template>
      <template #dropdown-button>
        <div>
          <span class="selected-workspace">
            <!-- TODO: storeState.selectedworkspaces.name -->
            Selected Workspace
          </span>
          <span class="tablet-selected"> ... </span>
        </div>
      </template>
      <template #menu-header>
        <p-tooltip
          class="menu-header-selected-workspace"
          position="bottom"
          contents="Selected Workspace Name"
        >
          <div class="workspace-wrapper">
            <span class="workspace-name">Workspace name</span>
          </div>
          <p-i
            name="ic_check"
            :color="violet[600]"
            width="1rem"
            height="1rem"
          />
        </p-tooltip>
      </template>
      <!-- <template #menu-item--format="{item}">
        <div class="menu-item-wrapper"></div>
      </template> -->
      <template #no-data-area>
        <div class="no-data-wrapper">
          <p class="title-wrapper">
            <span class="title">WORKSPACES</span>
            <span>0</span>
          </p>
          <p-empty class="empty"> No Results Found </p-empty>
        </div>
      </template>
    </p-select-dropdown>
  </div>
</template>

<style scoped lang="postcss">
.p-select-dropdown {
  min-width: 200px;
}
.top-bar-header {
  @apply inline-flex items-center w-full h-full;
  max-width: 20rem;
  width: 20rem;
  height: 1.75rem;
  margin-left: 1.25rem;

  &.admin-mode {
    width: 100%;
    max-width: initial;

    @screen mobile {
      box-shadow: none;
    }
  }

  @screen tablet {
    width: 8.75rem;
  }

  @screen mobile {
    width: 16.25rem;
    box-shadow: none;
  }

  .admin-header {
    @apply flex items-center;
    gap: 0.75rem;

    .admin-title {
      @apply flex text-label-lg text-violet-100 w-full;
      gap: 0.25rem;
    }

    @screen tablet {
      gap: 0.5rem;
    }
  }
  .workspace-dropdown {
    @apply inline-flex;

    @screen tablet {
      width: 3.625rem;
    }

    .menu-header-selected-workspace {
      @apply relative flex items-center justify-between text-label-md font-medium;
      margin: 0.875rem 1rem;
      .workspace-wrapper {
        @apply flex items-center;
        flex: 1;
        gap: 0.75rem;
        .workspace-name {
          flex: 1;
          max-width: 13.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      &::before {
        @apply absolute;
        content: '';
        width: calc(100% + 2rem);
        bottom: -0.875rem;
        left: -1rem;
        border-bottom: 3px solid #dddddf;
      }
    }

    .menu-item-wrapper {
      @apply flex justify-between;
      max-width: 18rem;
      &.is-starred {
        .label-text {
          max-width: 15rem;
        }
      }
      &:hover {
        .label-text {
          max-width: 15rem;
        }
      }
      .label {
        @apply flex items-center gap-2;
      }
      .label-text {
        @apply truncate;
        max-width: 16.25rem;
      }
    }

    .workspace-toolbox-wrapper {
      @apply flex flex-col bg-white;
      padding: 0.25rem 1rem 0.5rem;
      width: 100%;
      gap: 0.625rem;
      .workspace-toolbox {
        @apply relative flex flex-col;
        gap: 0.5rem;
        .tool {
          height: 1.5rem;
        }
        .tools-divider {
          width: calc(100% + 2rem);
          height: 0.125rem;
          margin-left: -1rem;
        }
      }
    }

    .no-data-wrapper {
      .title-wrapper {
        @apply text-paragraph-sm text-gray-500;
        .title {
          @apply font-bold;
        }
      }
      .empty {
        padding-top: 0.75rem;
        padding-bottom: 1.5rem;
      }
    }

    /* custom design-system component - p-context-menu */
    :deep(.p-context-menu) {
      width: 20rem;
      margin-top: -0.125rem;
      margin-left: 0;
      .menu-container {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        max-height: calc(100vh - $top-bar-height - 7.1rem) !important;
      }
      .p-context-menu-item {
        .favorite-button {
          &:not(.active) {
            @apply hidden;
          }
          transform: scale(1);
        }
        &:hover {
          .favorite-button {
            @apply block;
          }
        }
      }
      .bottom-slot-area {
        padding: 0;
      }
    }

    &.is-domain-admin {
      .workspace-toolbox-wrapper {
        padding-bottom: 1rem;
      }

      /* custom design-system component - p-context-menu */
      :deep(.p-context-menu) {
        .menu-container {
          max-height: calc(100vh - $top-bar-height - 12.85rem) !important;
        }
      }
    }

    .selected-workspace {
      @apply text-label-lg text-gray-800 inline-block font-medium;
      max-width: 16rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
      padding-left: 0.5rem;
    }
    .tablet-selected {
      @apply hidden text-label-lg text-gray-800;
      padding-left: 0.75rem;
    }
  }
}
</style>
