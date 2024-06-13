package software

type RpmInfo struct {
	Arch      string   `json:"arch"`
	License   string   `json:"license"`
	Name      string   `json:"name"`
	Release   string   `json:"release"`
	Requires  []string `json:"requires"`
	Size      int      `json:"size"`
	SourceRpm string   `json:"sourceRpm"`
	Summary   string   `json:"summary"`
	Vendor    string   `json:"vendor"`
	Version   string   `json:"version"`
}

type RpmInfos []RpmInfo