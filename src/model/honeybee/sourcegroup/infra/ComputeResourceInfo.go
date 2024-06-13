package infra

type ComputeResource struct {
	CPU      CPU        `json:"cpu"`
	DataDisk []DataDisk `json:"data_disk"`
	Memory   Memory     `json:"memory"`
	RootDisk RootDisk   `json:"root_disk"`
}
