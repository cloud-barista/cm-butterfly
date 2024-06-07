package workflow

type TaskOptions struct {

	ApiConnectionId string `json:"api_connection_id"`
	Endpoint string `json:"endpoint"`
	Method string `json:"method"`
	RequestBody string `json:"request_body"`

}