package common

type ErrorResponse struct {
	Properties   HoneyBeeErr `json:"properties"`
}

type HoneyBeeErr struct {
	Error string `json:"error"`
}
