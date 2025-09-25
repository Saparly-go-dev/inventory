package models

type Paginator struct {
	Items      []interface{} `json:"items"`
	PageSize   int           `json:"page_size"`
	PageNumber int           `json:"page_number"`
	PageCount  int           `json:"page_count"`
	Total      int           `json:"total"`
}
