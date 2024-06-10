package software

type SoftwareInfo struct {
	Deb    []Deb `json:"deb"`
	Docker struct {
		Containers []Containers `json:"containers"`
	}
	Podman struct {
		Containers []Containers `json:"containers"`
	} `json:"podman"`
	Rpm []Rpm `json:"rpm"`
}
