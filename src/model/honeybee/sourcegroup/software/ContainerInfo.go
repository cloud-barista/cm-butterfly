package software

type ContainerInfo struct {
	Id              string          `json:"Id"`
	Command         string          `json:"command"`
	Created         int             `json:"created"`
	HostConfig      HostConfig      `json:"hostConfig"`
	Image           string          `json:"image"`
	ImageID         string          `json:"imageID"`
	Labels          DriverOpts      `json:"labels"`
	Mounts          []MountPointInfo          `json:"mounts"`
	Names           []string        `json:"names"`
	NetworkSettings NetworkSettingsInfo `json:"networkSettings"`
	Ports           []PortInfo         `json:"ports"`
	SizeRootFs      int             `json:"sizeRootFs"`
	SizeRw          int             `json:"sizeRw"`
	State           string          `json:"state"`
	Status          string          `json:"status"`
}
type ContainerInfos []ContainerInfo
