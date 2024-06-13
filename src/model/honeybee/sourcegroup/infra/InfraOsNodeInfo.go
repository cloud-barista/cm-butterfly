package infra

type NodeInfo struct {
	Hostname   string `json:"hostname"`
	Hypervisor string `json:"hypervisor"`
	Machineid  string `json:"machineid"`
	Timezone   string `json:"timezone"`
}
