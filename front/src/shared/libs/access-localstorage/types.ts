import { AuthorizationType } from '../store/auth';

export interface ILoginData {
  role: AuthorizationType;
  autoLogin: boolean;
}
