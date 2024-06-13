package infra

type Compute struct {
	ComputeResource ComputeResource `json:"compute_resource"`
	Connection      []Connection    `json:"connection"`
	Os              OS              `json:"os"`
}
