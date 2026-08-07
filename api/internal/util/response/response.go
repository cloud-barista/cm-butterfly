package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// CommonRequest represents the standard request format
type CommonRequest struct {
	PathParams  map[string]string `json:"pathParams"`
	QueryParams map[string]string `json:"queryParams"`
	Request     interface{}       `json:"request"`
}

// CommonResponse represents the standard response format
type CommonResponse struct {
	ResponseData interface{} `json:"responseData"`
	Status       WebStatus   `json:"status"`
}

// WebStatus represents the status of a response
type WebStatus struct {
	StatusCode int    `json:"code"`
	Message    string `json:"message"`
	// How long to wait before trying again, in seconds, when the subsystem said so.
	//
	// A subsystem that declines a request because it is momentarily at capacity answers with
	// Retry-After (cm-beetle does this on 503 when its async job pool is full, and on 429 for
	// its own cooldowns). That value is the only thing that tells a caller how long to wait,
	// and without it the wait is a guess.
	//
	// It is carried in the body rather than only as a header because the browser reads this
	// envelope, not the raw response. The header is set as well — see the proxy handler.
	RetryAfter string `json:"retryAfter,omitempty"`
}

// JSON sends a JSON response with the given status code
func JSON(c echo.Context, code int, data interface{}) error {
	return c.JSON(code, data)
}

// Success sends a successful response
func Success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, &CommonResponse{
		ResponseData: data,
		Status: WebStatus{
			StatusCode: http.StatusOK,
			Message:    http.StatusText(http.StatusOK),
		},
	})
}

// Created sends a created response
func Created(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusCreated, &CommonResponse{
		ResponseData: data,
		Status: WebStatus{
			StatusCode: http.StatusCreated,
			Message:    http.StatusText(http.StatusCreated),
		},
	})
}

// NoContent sends a no content response
func NoContent(c echo.Context) error {
	return c.NoContent(http.StatusNoContent)
}

// Error sends an error response
func Error(c echo.Context, code int, message string) error {
	return c.JSON(code, &CommonResponse{
		ResponseData: message,
		Status: WebStatus{
			StatusCode: code,
			Message:    http.StatusText(code),
		},
	})
}

// BadRequest sends a bad request response
func BadRequest(c echo.Context, message string) error {
	return Error(c, http.StatusBadRequest, message)
}

// Unauthorized sends an unauthorized response
func Unauthorized(c echo.Context, message string) error {
	return Error(c, http.StatusUnauthorized, message)
}

// Forbidden sends a forbidden response
func Forbidden(c echo.Context, message string) error {
	return Error(c, http.StatusForbidden, message)
}

// NotFound sends a not found response
func NotFound(c echo.Context, message string) error {
	return Error(c, http.StatusNotFound, message)
}

// InternalServerError sends an internal server error response
func InternalServerError(c echo.Context, message string) error {
	return Error(c, http.StatusInternalServerError, message)
}

// CommonResponseStatusOK creates an OK CommonResponse
func CommonResponseStatusOK(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusOK,
			Message:    http.StatusText(http.StatusOK),
		},
	}
}

// CommonResponseStatusNoContent creates a No Content CommonResponse
func CommonResponseStatusNoContent(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusNoContent,
			Message:    http.StatusText(http.StatusNoContent),
		},
	}
}

// CommonResponseStatusNotFound creates a Not Found CommonResponse
func CommonResponseStatusNotFound(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusNotFound,
			Message:    http.StatusText(http.StatusNotFound),
		},
	}
}

// CommonResponseStatusUnauthorized creates an Unauthorized CommonResponse
func CommonResponseStatusUnauthorized(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusUnauthorized,
			Message:    http.StatusText(http.StatusUnauthorized),
		},
	}
}

// CommonResponseStatusBadRequest creates a Bad Request CommonResponse
func CommonResponseStatusBadRequest(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusBadRequest,
			Message:    http.StatusText(http.StatusBadRequest),
		},
	}
}

// CommonResponseStatusForbidden creates a Forbidden CommonResponse
func CommonResponseStatusForbidden(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusForbidden,
			Message:    http.StatusText(http.StatusForbidden),
		},
	}
}

// CommonResponseStatusInternalServerError creates an Internal Server Error CommonResponse
func CommonResponseStatusInternalServerError(responseData interface{}) *CommonResponse {
	return &CommonResponse{
		ResponseData: responseData,
		Status: WebStatus{
			StatusCode: http.StatusInternalServerError,
			Message:    http.StatusText(http.StatusInternalServerError),
		},
	}
}
