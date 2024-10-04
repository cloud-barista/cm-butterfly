package utils

import "errors"

func PtrToStr(param interface{}) string {
	if param == nil {
		return ""
	}

	return param.(string)
}

func PtrToFloat(param interface{}) float64 {
	if param == nil {
		return 0
	}

	return param.(float64)
}

func InterToMapInter(param interface{}) (map[string]interface{}, error) {
	if param == nil {
		return nil, errors.New("interface to map[string]interface ")
	}

	v, ok := param.(map[string]interface{})

	if !ok {
		return nil, errors.New("interface to map[string]interface ")
	}

	return v, nil
}
