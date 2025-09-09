import { Breadcrumb } from '@/shared/types';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

interface GnbStoreState {
  breadcrumbs: Breadcrumb[];
  selectedItem: Breadcrumb;
}

// export const useGnbStore = defineStore('gnb', {
//   state: (): GnbStoreState => ({
//     breadcrumbsArr: [] as Breadcrumb[],
//     selectedItem: {} as Breadcrumb,
//   }),
//   actions: {
//     setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
//       this.breadcrumbsArr = breadcrumbs;
//     },
//     setSelectedItem(selectedItem: Breadcrumb) {
//       this.selectedItem = selectedItem;
//     },
//   },
// });

export const useGnbStore = defineStore('gnb', () => {
  const state = reactive<GnbStoreState>({
    breadcrumbs: [] as Breadcrumb[],
    selectedItem: {} as Breadcrumb,
  });

  const actions = {
    setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
      state.breadcrumbs = [...state.breadcrumbs, ...breadcrumbs];
    },
    removeBreadcrumbs() {
      state.breadcrumbs = [];
    },
    setSelectedItem(selectedItem: Breadcrumb) {
      state.selectedItem = selectedItem;
    },
  };

  const getters = {
    breadcrumbs: computed(() => state.breadcrumbs),
    selectedItem: computed(() => state.selectedItem),
  };

  return {
    state,
    getters,
    ...actions,
  };
});
