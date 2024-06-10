package infra

type Host struct {
	Dns              Dns                `json:"dns"`
	FirewallRule     []FirewallRule     `json:"firewall_rule"`
	NetworkInterface []NetworkInterface `json:"network_interface"`
	Route            []Route            `json:"route"`
}
