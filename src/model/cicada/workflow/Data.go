package workflow

type Data struct {
	//DefaultArgs   DefaultArgs `json:"default_args"`
	TaskGroups []TaskGroup `json:"task_groups"`
	Description string `json:"description"`	
}
