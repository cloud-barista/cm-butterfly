package workflow

type TaskGroup struct {
	//TaskGroupName   string `json:"task_group_name"`
	TaskGroupId   string `json:"id"`
	TaskGroupName   string `json:"name"`
	Description   string `json:"description"`
	Tasks   []Task `json:"tasks"`
	
}
