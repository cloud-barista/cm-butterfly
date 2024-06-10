package infra

type MountedInformation struct {
	Destination string `json:"destination"`
	Filesystem  string `json:"filesystem"`
	Option      string `json:"option"`
	Source      string `json:"source"`
}

type MountPoint struct {
	MountedInformation []MountedInformation `json:"mounted_information"`
}
