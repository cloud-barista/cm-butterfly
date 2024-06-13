package software

type PodmanInfo struct {
	Containers []ContainerInfo `json:"containers"`
}
