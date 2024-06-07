package workflow

type Task struct {
	// TaskName   string `json:"task_name"`
	// TaskComponent   string `json:"task_component"`
	// Operator   string `json:"operator"`	
	// TaskOperatorOptions   []TaskOperatorOption `json:"operator_options"`
	// Dependencies   []string `json:"dependencies"`

	TaskId string `json:"id"`
	TaskName string `json:"name"`
	Dependencies   []string `json:"dependencies"`
	TaskComponent   string `json:"task_component"`
	RequestBody string `json:"request_body"`
	
	//TaskOptions TaskOptions `json:"options"`
}
