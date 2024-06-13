package infra

type SecurityGroup struct {
	Description  string       `json:"description"`
	FirewallRule FirewallRule `json:"firewall_rule"`
	Id           string       `json:"id"`
	Name         string       `json:"name"`
	VnetId       string       `json:"vnet_id"`
}
