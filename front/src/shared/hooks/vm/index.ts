import { IVm } from '../../../entities/vm/model';

export function getCloudProvidersInVms(vms: IVm[]) {
  const provider: { [key: string]: any } = {};

  vms.forEach(vm => {
    const { providerName } = vm.connectionConfig;
    if (providerName) {
      provider[providerName] ||= {};
    }
  });

  console.log(provider);
  return provider;
}
