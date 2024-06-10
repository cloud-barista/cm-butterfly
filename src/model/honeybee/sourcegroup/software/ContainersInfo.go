package software

type Containers struct {
	Id              string          `json:"Id"`
	Command         string          `json:"command"`
	Created         int             `json:"created"`
	HostConfig      HostConfig      `json:"hostConfig"`
	Image           string          `json:"image"`
	ImageID         string          `json:"imageID"`
	Labels          DriverOpts      `json:"labels"`
	Mounts          Mounts          `json:"mounts"`
	Names           []string        `json:"names"`
	NetworkSettings NetworkSettings `json:"networkSettings"`
	Ports           []Ports         `json:"ports"`
	SizeRootFs      int             `json:"sizeRootFs"`
	SizeRw          int             `json:"sizeRw"`
	State           string          `json:"state"`
	Status          string          `json:"status"`
}
