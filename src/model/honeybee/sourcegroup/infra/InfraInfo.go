package infra

type InfraInfo struct {
	Compute Compute `json:"compute"`
	Gpu     Gpu     `json:"gpu"`
	Network Network `json:"network"`
	Storage Storage `json:"storage"`
}
