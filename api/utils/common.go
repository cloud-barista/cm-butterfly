package utils

func PtrToStr(param interface{}) string {
	if param == nil {
		return ""
	}

	return param.(string)
}
