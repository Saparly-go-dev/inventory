package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type FurniturePostgres struct {
	db *gorm.DB
}

type furnitureAllocationSum struct {
	FurnitureID int `gorm:"column:furniture_id"`
	Quantity    int `gorm:"column:quantity"`
}

func NewFurniturePostgres(db *gorm.DB) *FurniturePostgres {
	return &FurniturePostgres{db: db}
}

func (r *FurniturePostgres) Create(buffer models.UpdateFurniture) error {
	if buffer.TotalQuantity < 0 {
		return errors.New("total quantity cannot be negative")
	}

	newFurniture := models.Furniture{
		Name:          buffer.Name,
		Description:   buffer.Description,
		Info:          buffer.Info,
		Photo:         buffer.Photo,
		CategoryId:    buffer.CategoryId,
		TotalQuantity: buffer.TotalQuantity,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return r.db.Create(&newFurniture).Error
}

func (r *FurniturePostgres) GetById(id int) (models.Furniture, error) {
	var furniture models.Furniture
	if err := r.db.Preload("Category").Where("id = ?", id).First(&furniture).Error; err != nil {
		return models.Furniture{}, err
	}
	return furniture, nil
}

func (r *FurniturePostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Furniture
	var count int64

	offset := (pageNumber - 1) * pageSize
	query := r.db.Model(&models.Furniture{}).Preload("Category")
	if len(name) > 0 {
		query = query.Where("name ILIKE ?", "%"+name+"%")
	}

	if err := query.Count(&count).Error; err != nil {
		return page, err
	}
	if err := query.Order("id desc").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return page, err
	}
	if err := r.attachFurnitureAvailability(r.db, list); err != nil {
		return page, err
	}

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *FurniturePostgres) Update(id int, buffer models.UpdateFurniture) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var furniture models.Furniture
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", id).First(&furniture).Error; err != nil {
			return err
		}

		allocated, err := r.getAllocatedQuantity(tx, id)
		if err != nil {
			return err
		}
		if buffer.TotalQuantity < allocated {
			return errors.New("total quantity cannot be less than allocated quantity")
		}

		updateData := map[string]interface{}{
			"name":           buffer.Name,
			"description":    buffer.Description,
			"info":           buffer.Info,
			"photo":          buffer.Photo,
			"category_id":    buffer.CategoryId,
			"total_quantity": buffer.TotalQuantity,
			"updated_at":     time.Now(),
		}

		return tx.Model(&models.Furniture{}).Where("id = ?", id).Updates(updateData).Error
	})
}

func (r *FurniturePostgres) Delete(id int) error {
	allocated, err := r.getAllocatedQuantity(r.db, id)
	if err != nil {
		return err
	}
	if allocated > 0 {
		return errors.New("cannot delete furniture with active allocations")
	}

	result := r.db.Where("id = ?", id).Delete(&models.Furniture{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("furniture not found")
	}
	return nil
}

func (r *FurniturePostgres) GetAvailable() ([]models.Furniture, error) {
	var list []models.Furniture
	if err := r.db.Model(&models.Furniture{}).Preload("Category").Order("id desc").Find(&list).Error; err != nil {
		return nil, err
	}
	if err := r.attachFurnitureAvailability(r.db, list); err != nil {
		return nil, err
	}

	result := make([]models.Furniture, 0, len(list))
	for _, item := range list {
		if item.AvailableQuantity > 0 {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *FurniturePostgres) GetAllocations(furnitureID int) ([]models.FurnitureAllocation, error) {
	var allocations []models.FurnitureAllocation
	err := r.db.Model(&models.FurnitureAllocation{}).
		Preload("Employee").
		Where("furniture_id = ? AND returned_at IS NULL", furnitureID).
		Order("assigned_at desc").
		Find(&allocations).Error
	if err != nil {
		return nil, err
	}
	return allocations, nil
}

func (r *FurniturePostgres) Assign(input models.AssignFurnitureInput) error {
	if input.Quantity <= 0 {
		return errors.New("quantity must be greater than 0")
	}
	if (input.EmployeeID == nil && input.RoomNumber == nil) || (input.EmployeeID != nil && input.RoomNumber != nil) {
		return errors.New("assign furniture either to employee or room")
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		var furniture models.Furniture
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", input.FurnitureID).First(&furniture).Error; err != nil {
			return err
		}

		allocated, err := r.getAllocatedQuantity(tx, input.FurnitureID)
		if err != nil {
			return err
		}
		if allocated+input.Quantity > furniture.TotalQuantity {
			return errors.New("not enough furniture available")
		}

		var existing models.FurnitureAllocation
		query := tx.Model(&models.FurnitureAllocation{}).Where("furniture_id = ? AND returned_at IS NULL", input.FurnitureID)
		if input.EmployeeID != nil {
			query = query.Where("employee_id = ? AND room_number IS NULL", *input.EmployeeID)
		} else {
			query = query.Where("employee_id IS NULL AND room_number = ?", *input.RoomNumber)
		}

		err = query.First(&existing).Error
		if err == nil {
			return tx.Model(&models.FurnitureAllocation{}).Where("id = ?", existing.ID).Updates(map[string]interface{}{
				"quantity":    existing.Quantity + input.Quantity,
				"assigned_at": time.Now(),
			}).Error
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		allocation := models.FurnitureAllocation{
			FurnitureID: input.FurnitureID,
			EmployeeID:  input.EmployeeID,
			RoomNumber:  input.RoomNumber,
			Quantity:    input.Quantity,
			AssignedAt:  time.Now(),
		}
		return tx.Create(&allocation).Error
	})
}

func (r *FurniturePostgres) Return(input models.ReturnFurnitureInput) error {
	if input.Quantity <= 0 {
		return errors.New("quantity must be greater than 0")
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		var allocation models.FurnitureAllocation
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND returned_at IS NULL", input.AllocationID).
			First(&allocation).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("active allocation not found")
			}
			return err
		}

		if input.Quantity > allocation.Quantity {
			return errors.New("return quantity exceeds allocated quantity")
		}

		if input.Quantity == allocation.Quantity {
			now := time.Now()
			return tx.Model(&models.FurnitureAllocation{}).Where("id = ?", allocation.ID).Updates(map[string]interface{}{
				"returned_at": now,
			}).Error
		}

		return tx.Model(&models.FurnitureAllocation{}).Where("id = ?", allocation.ID).Update("quantity", allocation.Quantity-input.Quantity).Error
	})
}

func (r *FurniturePostgres) getAllocatedQuantity(db *gorm.DB, furnitureID int) (int, error) {
	var result struct {
		Quantity int
	}
	err := db.Model(&models.FurnitureAllocation{}).
		Select("COALESCE(SUM(quantity), 0) as quantity").
		Where("furniture_id = ? AND returned_at IS NULL", furnitureID).
		Scan(&result).Error
	if err != nil {
		return 0, err
	}
	return result.Quantity, nil
}

func (r *FurniturePostgres) attachFurnitureAvailability(db *gorm.DB, list []models.Furniture) error {
	if len(list) == 0 {
		return nil
	}

	ids := make([]int, 0, len(list))
	for _, item := range list {
		ids = append(ids, item.Id)
	}

	var rows []furnitureAllocationSum
	if err := db.Model(&models.FurnitureAllocation{}).
		Select("furniture_id, COALESCE(SUM(quantity), 0) as quantity").
		Where("furniture_id IN ? AND returned_at IS NULL", ids).
		Group("furniture_id").
		Scan(&rows).Error; err != nil {
		return err
	}

	sumByFurniture := make(map[int]int, len(rows))
	for _, row := range rows {
		sumByFurniture[row.FurnitureID] = row.Quantity
	}

	for i := range list {
		list[i].AllocatedQuantity = sumByFurniture[list[i].Id]
		list[i].AvailableQuantity = list[i].TotalQuantity - list[i].AllocatedQuantity
	}

	return nil
}
