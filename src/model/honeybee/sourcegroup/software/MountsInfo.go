package software

type MountPointInfo struct {
	Destination string `json:"destination"`
	Driver      string `json:"driver"`
	Mode        string `json:"mode"`
	Name        string `json:"name"`
	Propagation string `json:"propagation"`
	Rw          bool   `json:"rw"`
	Source      string `json:"source"`
	Type        string `json:"type"`
}

type MountPointInfos []MountPointInfo