package repository

import (
	"time"

	"gorm.io/gorm"
)

type StatisticsPostgres struct {
	db *gorm.DB
}

func NewStatisticsPostgres(db *gorm.DB) *StatisticsPostgres {
	return &StatisticsPostgres{db: db}
}

// ---------- response structs ----------

type StatusCount struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type NameCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type RecentAssignment struct {
	DeviceName   string    `json:"device_name"`
	EmployeeName string    `json:"employee_name"`
	AssignedAt   time.Time `json:"assigned_at"`
}

type StatisticsData struct {
	TotalDevices            int                `json:"total_devices"`
	TotalFurnitures         int                `json:"total_furnitures"`
	TotalEmployees          int                `json:"total_employees"`
	TotalBrands             int                `json:"total_brands"`
	TotalCategories         int                `json:"total_categories"`
	DevicesByStatus         []StatusCount      `json:"devices_by_status"`
	DevicesByCategory       []NameCount        `json:"devices_by_category"`
	DevicesByBrand          []NameCount        `json:"devices_by_brand"`
	TopEmployeesByDevice    []NameCount        `json:"top_employees_by_devices"`
	TopEmployeesByFurniture []NameCount        `json:"top_employees_by_furnitures"`
	TopRoomsByFurniture     []NameCount        `json:"top_rooms_by_furnitures"`
	RecentAssignments       []RecentAssignment `json:"recent_assignments"`
}

// ---------- implementation ----------

func (r *StatisticsPostgres) GetStatistics() (StatisticsData, error) {
	var data StatisticsData

	// Total counts
	var cnt int64

	r.db.Table("devices").Count(&cnt)
	data.TotalDevices = int(cnt)

	r.db.Table("furnitures").Count(&cnt)
	data.TotalFurnitures = int(cnt)

	r.db.Table("employees").Count(&cnt)
	data.TotalEmployees = int(cnt)

	r.db.Table("brands").Count(&cnt)
	data.TotalBrands = int(cnt)

	r.db.Table("categories").Count(&cnt)
	data.TotalCategories = int(cnt)

	// Devices by status
	if err := r.db.Table("devices").
		Select("status, COUNT(*) as count").
		Group("status").
		Order("count DESC").
		Scan(&data.DevicesByStatus).Error; err != nil {
		return data, err
	}

	// Devices by category
	if err := r.db.Table("devices").
		Select("categories.name as name, COUNT(*) as count").
		Joins("LEFT JOIN categories ON categories.id = devices.category_id").
		Group("categories.name").
		Order("count DESC").
		Scan(&data.DevicesByCategory).Error; err != nil {
		return data, err
	}

	// Devices by brand
	if err := r.db.Table("devices").
		Select("brands.name as name, COUNT(*) as count").
		Joins("LEFT JOIN brands ON brands.id = devices.brand_id").
		Group("brands.name").
		Order("count DESC").
		Scan(&data.DevicesByBrand).Error; err != nil {
		return data, err
	}

	// Employees by current assigned devices (top 10)
	if err := r.db.Table("device_assignments").
		Select("employees.full_name as name, COUNT(*) as count").
		Joins("JOIN employees ON employees.id = device_assignments.employee_id").
		Where("device_assignments.returned_at IS NULL").
		Where("COALESCE(employees.full_name, '') <> ''").
		Group("employees.full_name").
		Order("count DESC").
		Limit(10).
		Scan(&data.TopEmployeesByDevice).Error; err != nil {
		return data, err
	}

	if err := r.db.Table("furniture_allocations").
		Select("employees.full_name as name, COALESCE(SUM(furniture_allocations.quantity), 0) as count").
		Joins("JOIN employees ON employees.id = furniture_allocations.employee_id").
		Where("furniture_allocations.returned_at IS NULL").
		Where("COALESCE(employees.full_name, '') <> ''").
		Group("employees.full_name").
		Order("count DESC").
		Limit(10).
		Scan(&data.TopEmployeesByFurniture).Error; err != nil {
		return data, err
	}

	if err := r.db.Table("furniture_allocations").
		Select("CAST(furniture_allocations.room_number AS TEXT) as name, COALESCE(SUM(furniture_allocations.quantity), 0) as count").
		Where("furniture_allocations.returned_at IS NULL").
		Where("furniture_allocations.room_number IS NOT NULL").
		Group("furniture_allocations.room_number").
		Order("count DESC").
		Limit(10).
		Scan(&data.TopRoomsByFurniture).Error; err != nil {
		return data, err
	}

	// Recent assignments (last 10)
	if err := r.db.Table("device_assignments").
		Select("devices.name as device_name, employees.full_name as employee_name, device_assignments.assigned_at").
		Joins("LEFT JOIN devices ON devices.id = device_assignments.device_id").
		Joins("LEFT JOIN employees ON employees.id = device_assignments.employee_id").
		Order("device_assignments.assigned_at DESC").
		Limit(10).
		Scan(&data.RecentAssignments).Error; err != nil {
		return data, err
	}

	return data, nil
}
