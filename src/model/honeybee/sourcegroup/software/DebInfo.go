package software

type DebInfo struct {
	Architecture  string   `json:"architecture"`
	Conffiles     []string `json:"conffiles"`
	Depends       string   `json:"depends"`
	Description   string   `json:"description"`
	Homepage      string   `json:"homepage"`
	InstalledSize int      `json:"installed_size"`
	Maintainer    string   `json:"maintainer"`
	MultiArch     string   `json:"multi_arch"`
	Package       string   `json:"package"`
	PreDepends    string   `json:"pre_depends"`
	Priority      string   `json:"priority"`
	Section       string   `json:"section"`
	Source        string   `json:"source"`
	Status        string   `json:"status"`
	Version       string   `json:"version"`
}

type DebInfos []DebInfo