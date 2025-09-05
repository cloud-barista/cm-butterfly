import axios from 'axios';
import { McmpRouter } from '@/app/providers/router';
import { AUTH_ROUTE } from '@/pages/auth/auth.route';
import { axiosPost, IAxiosResponse } from '@/shared/libs/api/index';
import { IUserLoginResponse } from '@/entities';
import { jwtDecode } from 'jwt-decode';
import LocalStorageConnector from '@/shared/libs/access-localstorage/localStorageConnector';

interface IJwtToken {
  access_token: string;
  refresh_token: string;
}

const url = import.meta.env.VITE_BACKEND_ENDPOINT;

export default class JwtTokenProvider {
  private static tokenProvider: JwtTokenProvider | null = null;
  private localstorage: LocalStorageConnector<IJwtToken>;
  private REFRESH_TOKEN_URL = 'auth/refresh';
  private TOKEN_STORAGE = 'MCMP_TOEKN';
  private static TOKEN_VALIDATION_URL = 'auth/validate';
  private refresh_token = '';
  private access_token = '';

  constructor() {
    this.localstorage = new LocalStorageConnector<IJwtToken>(
      this.TOKEN_STORAGE,
    );

    const storeValue = this.localstorage.getValue();
    if (storeValue) {
      this.access_token = storeValue.access_token;
      this.refresh_token = storeValue.refresh_token;
    }
  }

  static getProvider() {
    if (this.tokenProvider === null) {
      this.tokenProvider = new JwtTokenProvider();
    }

    return this.tokenProvider;
  }

  public getTokens(): IJwtToken {
    return {
      refresh_token: this.refresh_token,
      access_token: this.access_token,
    };
  }

  public setTokens(token: IJwtToken) {
    this.refresh_token = token.refresh_token;
    this.access_token = token.access_token;
    this.localstorage.setItem(token);
  }

  public removeToken() {
    this.localstorage.removeItem();
  }

  public static async validateToken() {
    await axiosPost(this.TOKEN_VALIDATION_URL, null);
  }

  public async refreshTokens() {
    try {
      const refreshRes = await axios.post<IAxiosResponse<IUserLoginResponse>>(
        url + `/${this.REFRESH_TOKEN_URL}`,
        {
          request: {
            refresh_token: this.refresh_token,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.access_token}`,
          },
        },
      );

      if (!refreshRes.data || !refreshRes.data.responseData) {
        throw new Error('Token refresh error');
      }
      return refreshRes;
    } catch (error: any) {
      this.removeToken();

      alert('User Session Expired.\n Pleas login again');
      McmpRouter.getRouter()
        .replace({ name: AUTH_ROUTE.LOGIN._NAME })
        .catch(() => {});

      return Promise.reject(error);
    }
  }

  public parseAccessToken() {
    let decodedToken: any = {};
    try {
      decodedToken = jwtDecode(this.access_token);
    } catch (e) {
      console.log(e);
    }
    return decodedToken;
  }
}
