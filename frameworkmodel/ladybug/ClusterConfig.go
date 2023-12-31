package ladybug

type ClusterConfig struct {
	InstallMonAgent string     `json:"installMonAgent"`
	Kubernetes      Kubernetes `json:"kubernetes"`
}

type Kubernetes struct {
	NetworkCni       string `json:"networkCni"`
	PodCidr          string `json:"podCidr"`
	ServiceCidr      string `json:"serviceCidr"`
	ServiceDnsDomain string `json:"serviceDnsDomain"`
}
