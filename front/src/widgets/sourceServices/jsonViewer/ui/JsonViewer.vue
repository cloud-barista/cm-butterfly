<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { JsonEditor } from '@/features/sourceServices';
import { PI } from '@cloudforet-test/mirinae';
import { reactive, ref } from 'vue';

const state = reactive({
  schema: {
    type: 'object',
    properties: {
      os_version: {
        type: 'string',
        title: 'os_version',
      },
      os: {
        type: 'string',
        title: 'os',
      },
      email: {
        type: 'string',
        title: 'email',
      },
    },
  } as any,
  formData: {
    os_version: '1.0.0',
    os: 'windows',
    email: 'test@test.com',
  } as any,
});

// TODO: api로 받아온 데이터로 변경
const _formData =
  '{\n "compute": {\n  "os": {\n   "os": {\n    "pretty_name": "Ubuntu 20.04.6 LTS",\n    "name": "Ubuntu",\n    "version_id": "20.04",\n    "version": "20.04.6 LTS (Focal Fossa)",\n    "version_codename": "focal",\n    "id": "ubuntu",\n    "id_like": "debian"\n   },\n   "kernel": {\n    "release": "5.15.0-1063-aws",\n    "version": "#69~20.04.1-Ubuntu SMP Fri May 10 19:20:12 UTC 2024",\n    "architecture": "x86_64"\n   },\n   "node": {\n    "hostname": "ip-172-31-15-13",\n    "hypervisor": "xen",\n    "machineid": "ec2c1872-e2c7-c905-2790-87c9c3c98ad7",\n    "timezone": "UTC"\n   }\n  },\n  "compute_resource": {\n   "cpu": {\n    "vendor": "GenuineIntel",\n    "model": "Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz",\n    "max_speed": 2299,\n    "cache": 46080,\n    "cpus": 2,\n    "cores": 0,\n    "threads": 0\n   },\n   "memory": {\n    "type": "RAM",\n    "speed": 0,\n    "size": 4096,\n    "used": 2796,\n    "available": 1300\n   },\n   "root_disk": {\n    "name": "",\n    "label": "",\n    "type": "",\n    "size": 0,\n    "used": 0,\n    "available": 0\n   },\n   "data_disk": []\n  },\n  "connection": null\n },\n "network": {\n  "host": {\n   "network_interface": [\n    {\n     "interface": "lo",\n     "address": [\n      "127.0.0.1/8",\n      "::1/128"\n     ],\n     "gateway": "",\n     "mac_address": "",\n     "mtu": 65536\n    },\n    {\n     "interface": "eth0",\n     "address": [\n      "172.31.15.13/20",\n      "fe80::72:7dff:fe8f:dc48/64"\n     ],\n     "gateway": "172.31.0.1",\n     "mac_address": "02:72:7d:8f:dc:48",\n     "mtu": 9001\n    }\n   ],\n   "dns": {\n    "dns_server": [\n     "172.31.0.2",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     "",\n     ""\n    ]\n   },\n   "route": [\n    {\n     "destination": "0.0.0.0",\n     "netmask": "0.0.0.0",\n     "next_hop": "172.31.0.1"\n    },\n    {\n     "destination": "172.31.0.0",\n     "netmask": "255.255.240.0",\n     "next_hop": "eth0"\n    },\n    {\n     "destination": "172.31.0.1",\n     "netmask": "255.255.255.255",\n     "next_hop": "eth0"\n    }\n   ],\n   "firewall_rule": []\n  },\n  "csp": {\n   "name": "",\n   "vpc": null,\n   "nlb": null,\n   "security_group": null\n  }\n },\n "gpu": {\n  "nvidia": [],\n  "drm": []\n },\n "storage": {\n  "mount_point": {\n   "mounted_information": null\n  }\n }\n}\n",';

const convertedJson = ref('');
const isConverted = ref(false);

const handleConvertJson = () => {
  convertedJson.value = _formData;
  isConverted.value = true;
};
</script>

<template>
  <div class="json-viewer-layout">
    <json-editor
      :schema="state.schema"
      :form-data="_formData"
      title="Meta (data)"
      :read-only="true"
    />
    <button class="convert-btn" @click="handleConvertJson">
      <p-i
        class="icon"
        name="ic_arrow-right"
        color="white"
        width="1rem"
        height="1rem"
      />
      {{ i18n.t('COMPONENT.BUTTON_MODAL.CONVERT') }}
    </button>
    <json-editor
      :schema="state.schema"
      :form-data="convertedJson"
      title="Model"
      :read-only="false"
    />
  </div>
</template>

<style scoped lang="postcss">
.json-viewer-layout {
  @apply flex justify-center;
  min-width: 480px;
  .convert-btn {
    @apply flex justify-center items-center rounded-[4px] text-[#fff] bg-violet-400;
    font-size: 14px;
    padding: 0 12px;
  }
  .convert-btn:hover {
    @apply bg-violet-500;
  }
  .icon {
    @apply mr-[0.25rem];
  }
}
</style>
