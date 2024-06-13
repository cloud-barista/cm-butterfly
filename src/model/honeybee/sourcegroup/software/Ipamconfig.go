package software

type Ipamconfig struct {
	Ipv4Address  string   `json:"ipv4Address"`
	Ipv6Address  string   `json:"ipv6Address"`
	LinkLocalIPs []string `json:"linkLocalIPs"`
}
