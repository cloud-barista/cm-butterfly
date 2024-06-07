package workflow


// type WorkflowInfo struct {
// 	workflowId       string `json:"workflowId"`
// }



type WorkflowInfo struct {

	WorkflowId string `json:"id"`
	WorkflowName string `json:"name"`
	WorkflowData Data `json:"data"`

	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	
	// Description string `json:"description"`
	// TaskGroups []TaskGroup `json:"task_groups"`
}