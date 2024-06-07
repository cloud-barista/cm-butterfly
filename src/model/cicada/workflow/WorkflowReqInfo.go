package workflow

type WorkflowReqInfo struct {
	//WorkflowId string `json:"id"`
	WorkflowName string `json:"name"`
	WorkflowData Data `json:"data"`	

	// TaskGroups []TaskGroup `json:"task_groups"`
	// Description string `json:"description"`	
}