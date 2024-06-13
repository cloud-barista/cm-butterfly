package infra

type DataDisk struct {
	Label string `json:"label"`
	Size  int    `json:"size"`
	Type  string `json:"type"`
}
