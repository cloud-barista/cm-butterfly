package infra

type OsInner struct {
	Architecture string `json:"architecture"`
	Name         string `json:"name"`
	Release      string `json:"release"`
	Vendor       string `json:"vendor"`
	Version      string `json:"version"`
}
