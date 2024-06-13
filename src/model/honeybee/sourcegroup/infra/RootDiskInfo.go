package infra

type RootDisk struct {
	Label string `json:"label"`
	Size  int    `json:"size"`
	Type  string `json:"type"`
}
