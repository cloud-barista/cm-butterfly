export interface IValidationResult {
  isValid: boolean;
  message?: string | null;
}

export interface IUserLogin {
  id: string;
  password: string;
}

export interface IUserLoginResponse {
  role: string;
  access_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  refresh_token?: string;
}

export interface IPasswordConfirm {
  password: string;
  comparedPassword: string;
}

interface IUserAccess {
  impersonate: boolean;
  manage: boolean;
  manageGroupMembership: boolean;
  mapRoles: boolean;
  view: boolean;
}

export interface IUserInfoResponse {
  access: IUserAccess;
  createdTimestamp: number;
  disableableCredentialTypes: any[];
  email: string;
  emailVerified: boolean;
  enabled: boolean;
  firstName: string;
  id: string;
  lastName: string;
  requiredActions: any[];
  totp: boolean;
  username: string;
  description?: string;
  company?: string;
  department?: string;
  approved?: boolean;
  group: [];
  callInvite: string;
  receiveInvite: string;
  defaultRoles: [];
}

export type UserInformationTableType =
  | 'userId'
  | 'name'
  | 'description'
  | 'company'
  | 'department'
  | 'group'
  | 'approved'
  | 'callInvite'
  | 'receiveInvite'
  | 'defaultRoles'
  | 'username';

export type UserWorkspaceTableType =
  | 'workspace'
  | 'role'
  | 'invited'
  | 'removeAction';
