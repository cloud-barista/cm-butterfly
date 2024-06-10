package infra

type Kernel struct {
	Architecture string `json:"architecture"`
	Release      string `json:"release"`
	Version      string `json:"version"`
}
