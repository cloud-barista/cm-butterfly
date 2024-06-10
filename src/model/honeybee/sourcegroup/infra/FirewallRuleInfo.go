package infra

type FirewallRule []struct {
	Action    string `json:"action"`
	Direction string `json:"direction"`
	Dst       string `json:"dst"`
	DstPorts  string `json:"dst_ports"`
	Priority  int    `json:"priority"`
	Protocol  string `json:"protocol"`
	Src       string `json:"src"`
	SrcPorts  string `json:"src_ports"`
}
