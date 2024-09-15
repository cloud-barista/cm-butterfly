import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const useUserWorkspaceStore = defineStore('user-workspace-store', () => {
  const state = reactive<any>({
    items: [],
    currentWorkspaceId: '',
  });

  const getters = reactive({
    workspaceList: computed<any[]>(() => state.items || []),
    workspaceMap: computed(() => {
      const map = {};
      getters.workspaceList.forEach(workspace => {
        map[workspace.workspace_id] = workspace;
      });
      return map;
    }),
    currentWorkspace: computed<any | undefined>(() => {
      const found = state.items.find(
        workspace => workspace.workspace_id === state.currentWorkspaceId,
      );
      let currentItem: any | undefined;
      if (found) {
        currentItem = found;
      } else {
        currentItem = undefined;
      }
      return currentItem;
    }),
    currentWorkspaceId: computed<string | undefined>(
      () => state.currentWorkspaceId,
    ),
  });

  const mutations = {
    setCurrentWorkspace(workspaceId?: string) {
      state.currentWorkspaceId = workspaceId;
    },
  };

  const actions = {
    // async load() {
    //   const { results } =
    //     await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<
    //       undefined,
    //       ListResponse<WorkspaceModel>
    //     >();
    //   state.items =
    //     results?.filter(workspace => workspace.state === 'ENABLED') || [];
    // },
    getIsAccessibleWorkspace(workspaceId: string) {
      if (!workspaceId) return false;
      return state.items.some(
        workspace => workspace.workspace_id === workspaceId,
      );
    },
    reset() {
      state.items = [];
      state.currentWorkspaceId = undefined;
    },
  };

  return {
    getters,
    ...mutations,
    ...actions,
  };
});
