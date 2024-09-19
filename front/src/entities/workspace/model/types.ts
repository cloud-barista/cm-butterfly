export interface IWorkspaceDeleteData {
  userId: string;
  workspaceId: string;
}

export interface IWorkspaceDetailData {
  role: {
    created_at: string;
    description: string;
    id: string;
    name: string;
    policy: string;
    updated_at: string;
  };
  workspaceProject: {
    projects: Array<{
      created_at: string;
      description: string | null;
      id: string;
      name: string;
      ns_id: string;
      updated_at: string;
    }>;
    workspace: IWorkspaceData;
  };
}

export interface IWorkspaceData {
  created_at: string;
  description: string;
  id: string;
  name: string;
  updated_at: string;
}

export interface IEditWorkspaceData {
  name: string;
  workspaceId: string;
  roleId: string;
}

export interface IWorkspaceRoleResponse {
  roles: [
    {
      name: string;
      id: string;
    },
  ];
}
