package workflow

type WorkflowStatusInfo struct {
	Message string `json:"message"`
	Phase   string `json:"phase"` //Pending, Provisioning, Provisioned, Failed
	Reason  int    `json:"reason"`
}