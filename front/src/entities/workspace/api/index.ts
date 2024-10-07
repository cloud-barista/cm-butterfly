import {
  IEditWorkspaceData,
  IWorkspaceData,
  IWorkspaceDeleteData,
  IWorkspaceDetailData,
  IWorkspaceRoleResponse,
} from '../model/types.ts';
import { axiosInstance } from '../../../shared/libs/api/instance.ts';
import { UserInformationTableType, UserWorkspaceTableType } from '../../index';
import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '../../../shared/libs';

const DELETE_WORKSPACE_BY_ID = 'deleteworkspaceuserrolemapping';
const GET_WORKSPACELIST_BY_ID = 'GetWorkspaceUserRoleMappingListByUserId';
const GET_WORKSPACELIST = 'GetWorkspaceList';
const EDIT_USER_WORKSPACE_MAPPING = 'createworkspaceuserrolemappingbyname';
const DELETE_USER_WORKSPACE_MAPPING = 'deleteworkspaceuserrolemapping';
const WORKSPACE_ROLE_LIST = 'getWorkspaceRoleList';

export function useDeleteWorkspaceById(
  deleteData: IWorkspaceDeleteData | null,
) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IWorkspaceDeleteData | null>, 'pathParams'>
  > = {
    pathParams: deleteData,
  };
  return useAxiosPost<
    IAxiosResponse<{ message: string }>,
    Required<
      Pick<RequestBodyWrapper<IWorkspaceDeleteData | null>, 'pathParams'>
    >
  >(DELETE_WORKSPACE_BY_ID, requestBodyWrapper);
}

export function useGetWorkspaceListById(userId: string | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<{ userId: string | null }>, 'pathParams'>
  > = {
    pathParams: { userId },
  };

  return useAxiosPost<
    IAxiosResponse<IWorkspaceDetailData[]>,
    Required<Pick<RequestBodyWrapper<{ userId: string | null }>, 'pathParams'>>
  >(GET_WORKSPACELIST_BY_ID, requestBodyWrapper);
}

export function useGetWorkspaceList() {
  return useAxiosPost<IAxiosResponse<IWorkspaceData[]>, null>(
    GET_WORKSPACELIST,
    null,
  );
}

export function useEditWorkspaceList(requestData: IEditWorkspaceData | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IEditWorkspaceData | null>, 'request'>
  > = {
    request: requestData,
  };

  return useAxiosPost<
    IAxiosResponse<IWorkspaceDetailData[]>,
    Required<Pick<RequestBodyWrapper<IEditWorkspaceData | null>, 'request'>>
  >(EDIT_USER_WORKSPACE_MAPPING, requestBodyWrapper);
}

export function useWorkspaceRoleList() {
  return useAxiosPost<IAxiosResponse<IWorkspaceRoleResponse>, null>(
    WORKSPACE_ROLE_LIST,
    null,
  );
}

export function useBulkAddWorkspaceList(
  workspaces: IEditWorkspaceData[],
  userId: string,
  roleId: string,
) {
  const promiseArr = workspaces.map(workspace => {
    return axiosInstance.post(EDIT_USER_WORKSPACE_MAPPING, {
      request: {
        workspaceId: workspace.name,
        userId,
        roleId,
      },
    });
  });

  return Promise.all(promiseArr);
}

export function useBulkDeleteWorkspaceList(
  workspaces: Partial<
    Record<
      UserInformationTableType | UserWorkspaceTableType | 'originalData',
      any
    >
  >[],
  userId: string,
) {
  const promiseArr = workspaces.map(workspace => {
    return axiosInstance.post(DELETE_USER_WORKSPACE_MAPPING, {
      pathParams: {
        workspaceId: workspace.originalData.workspaceProject.workspace.id,
        userId,
      },
    });
  });

  return Promise.all(promiseArr);
}
