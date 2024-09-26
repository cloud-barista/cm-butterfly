package handler

type Status string

const (
	Success        Status = "S0001"
	PartialSuccess Status = "S0002"
	Failed         Status = "S0003"
)
