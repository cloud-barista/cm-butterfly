package infra

type Performance struct {
	Bar1MemoryTotal int `json:"bar1_memory_total"`
	Bar1MemoryUsage int `json:"bar1_memory_usage"`
	Bar1MemoryUsed  int `json:"bar1_memory_used"`
	FbMemoryTotal   int `json:"fb_memory_total"`
	FbMemoryUsage   int `json:"fb_memory_usage"`
	FbMemoryUsed    int `json:"fb_memory_used"`
	GpuUsage        int `json:"gpu_usage"`
}
