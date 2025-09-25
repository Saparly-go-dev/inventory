package repository

import "inventory/models"

// CreatePaginator создает пагинатор для любого типа элементов
func CreatePaginator[T any](items []T, total, pageSize, pageNumber int) models.Paginator {
	// Конвертируем []T в []interface{}
	interfaceItems := make([]interface{}, len(items))
	for i, v := range items {
		interfaceItems[i] = v
	}

	pageCount := total / pageSize
	if total%pageSize != 0 {
		pageCount++
	}

	return models.Paginator{
		Items:      interfaceItems,
		PageSize:   pageSize,
		PageNumber: pageNumber,
		PageCount:  pageCount,
		Total:      total,
	}
}
