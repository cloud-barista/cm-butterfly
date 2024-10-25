import { defineStore } from 'pinia';

export interface SourceService {
  name: string;
  description: string | null | undefined;
}
export interface SourceConnection {
  name: string;
  description: string;
  ip_address: string;
  user: string;
  private_key: string;
  ssh_port: number;
  password: string;
}

export const useSourceServiceStore = defineStore('source-service-store', {
  state: () => ({
    sourceServiceInfo: {} as SourceService,
    sourceConnectionInfoList: [] as SourceConnection[],
    sourceConnectionNameList: [] as string[],
    withSourceConnection: false,
    editingSourceConnectionList: [] as SourceConnection[],
  }),
  getters: {},
  actions: {
    setSourceConnectionNameList(connectionNameList: string[]) {
      this.sourceConnectionNameList = connectionNameList;
    },
    setWithSourceConnection() {
      this.withSourceConnection = !this.withSourceConnection;
    },
    setSourceConnectionInfoList(connectionInfoList: SourceConnection) {
      this.sourceConnectionInfoList = [
        ...this.sourceConnectionInfoList,
        connectionInfoList,
      ];
    },
  },
});
