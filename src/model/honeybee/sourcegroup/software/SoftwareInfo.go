package software

type SoftwareInfo struct {
	Deb    []DebInfo `json:"deb"`
	Docker DockerInfo `json:"docker"`
	Podman PodmanInfo `json:"podman"`
	Rpm []RpmInfo `json:"rpm"`
}

