package software

type DockerInfo struct {
	Containers []ContainerInfo `json:"containers"`
}
