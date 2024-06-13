package infra

type OS struct {
	Kernel Kernel   `json:"kernel"`
	Node   NodeInfo `json:"node"`
	Os     OsInner  `json:"os"`
}
