import {
  ROLE_TYPE,
  ROLE_STATE,
} from '@/shared/libs/accessControl/pageAccessHelper/constant';

export type RoleType = (typeof ROLE_TYPE)[keyof typeof ROLE_TYPE];

export type RoleState = (typeof ROLE_STATE)[keyof typeof ROLE_STATE];
