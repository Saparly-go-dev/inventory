package repository

import (
	"inventory/models"
	"sort"
	"strconv"
	"strings"

	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type DashboardPostgres struct {
	db *gorm.DB
}

func NewDashboardPostgres(db *gorm.DB) *DashboardPostgres {
	return &DashboardPostgres{db: db}
}

type DeviceFilters struct {
	ModelID          *int
	CategoryID       *int
	BrandID          *int
	RoomNumber       *int
	EmployeeID       *int
	Status           *string
	AttributeID      *int
	AttributeOptions *string
	AttributeInfo    *string
}

type DashboardDevice struct {
	models.Device
	EmployeeFullName string                   `json:"employee_full_name"`
	RoomNumber       int                      `json:"room_number"`
	Attributes       []models.DeviceAttribute `json:"attributes"`
}

// internal struct for assignment info
type deviceAssignRow struct {
	DeviceId         int    `gorm:"column:device_id"`
	EmployeeFullName string `gorm:"column:employee_full_name"`
	RoomNumber       int    `gorm:"column:room_number"`
}

func (r *DashboardPostgres) GetAllDevices(filters DeviceFilters) ([]DashboardDevice, error) {
	// 1) Загружаем устройства как чистые модели + Preload связей
	var baseDevices []models.Device

	devQ := r.db.Model(&models.Device{}).
		Preload("Brand").
		Preload("Model").
		Preload("Category")

	// Базовые фильтры по устройству
	if filters.ModelID != nil {
		devQ = devQ.Where("devices.model_id = ?", *filters.ModelID)
	}
	if filters.CategoryID != nil {
		devQ = devQ.Where("devices.category_id = ?", *filters.CategoryID)
	}
	if filters.BrandID != nil {
		devQ = devQ.Where("devices.brand_id = ?", *filters.BrandID)
	}
	if filters.Status != nil {
		devQ = devQ.Where("devices.status = ?", *filters.Status)
	}

	// Фильтры по атрибутам
	attributeIDOn := filters.AttributeID != nil && *filters.AttributeID > 0
	attributeOptionsOn := filters.AttributeOptions != nil && *filters.AttributeOptions != ""
	attributeInfoOn := filters.AttributeInfo != nil && *filters.AttributeInfo != ""

	if attributeIDOn || attributeOptionsOn || attributeInfoOn {
		devQ = devQ.
			Joins(`JOIN device_attributes da ON da.device_id = devices.id`).
			Distinct("devices.*")

		if attributeIDOn {
			devQ = devQ.Where(`da.attribute_id = ?`, *filters.AttributeID)
		}
		if attributeOptionsOn {
			devQ = devQ.Where(`da.options ILIKE ?`, "%"+*filters.AttributeOptions+"%")
		}
		if attributeInfoOn {
			devQ = devQ.Where(`da.info ILIKE ?`, "%"+*filters.AttributeInfo+"%")
		}
	}

	if err := devQ.Find(&baseDevices).Error; err != nil {
		return nil, err
	}
	if len(baseDevices) == 0 {
		return []DashboardDevice{}, nil
	}

	deviceIDs := make([]int, 0, len(baseDevices))
	for _, d := range baseDevices {
		deviceIDs = append(deviceIDs, d.Id)
	}

	// 2) Подтягиваем инфу о текущем назначении (employee + room) одним запросом
	assignQ := r.db.Table("devices").
		Select(`
			devices.id as device_id,
			COALESCE(employees.full_name, '') as employee_full_name,
			COALESCE(employees.room_number, 0) as room_number
		`).
		Joins(`
			LEFT JOIN device_assignments
				ON device_assignments.device_id = devices.id
				AND device_assignments.returned_at IS NULL
		`).
		Joins(`LEFT JOIN employees ON employees.id = device_assignments.employee_id`).
		Where("devices.id IN ?", deviceIDs)

	// Если фильтруем по employee/room — применяем тут, чтобы не ломать основной список
	if filters.EmployeeID != nil {
		assignQ = assignQ.Where("employees.id = ?", *filters.EmployeeID)
	}
	if filters.RoomNumber != nil {
		assignQ = assignQ.Where("employees.room_number = ?", *filters.RoomNumber)
	}

	var assignRows []deviceAssignRow
	if err := assignQ.Scan(&assignRows).Error; err != nil {
		return nil, err
	}

	assignByDevice := make(map[int]deviceAssignRow, len(assignRows))
	for _, row := range assignRows {
		assignByDevice[row.DeviceId] = row
	}

	// 3) Атрибуты одним запросом
	var attrs []models.DeviceAttribute
	if err := r.db.
		Model(&models.DeviceAttribute{}).
		Preload("Attribute").
		Where("device_id IN ?", deviceIDs).
		Find(&attrs).Error; err != nil {
		return nil, err
	}

	attrsByDevice := make(map[int][]models.DeviceAttribute, len(baseDevices))
	for _, a := range attrs {
		attrsByDevice[a.DeviceId] = append(attrsByDevice[a.DeviceId], a)
	}

	// 4) Собираем результат
	result := make([]DashboardDevice, 0, len(baseDevices))

	for _, d := range baseDevices {
		// Если включены фильтры по employee/room, то нужно отфильтровать устройства,
		// которые не попали в assignRows.
		if filters.EmployeeID != nil || filters.RoomNumber != nil {
			if _, ok := assignByDevice[d.Id]; !ok {
				continue
			}
		}

		row := assignByDevice[d.Id] // если нет — будет zero, и это нормально
		dd := DashboardDevice{
			Device:           d,
			EmployeeFullName: row.EmployeeFullName,
			RoomNumber:       row.RoomNumber,
			Attributes:       attrsByDevice[d.Id],
		}

		sort.Slice(dd.Attributes, func(i, j int) bool {
			return dd.Attributes[i].Id < dd.Attributes[j].Id
		})

		result = append(result, dd)
	}

	return result, nil
}

func (r *DashboardPostgres) ExportAllDevicesToExcel(devices []DashboardDevice) ([]byte, error) {
	f := excelize.NewFile()
	sheetName := "Devices"

	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, err
	}

	headers := []string{"ID", "Name", "Status", "Brand", "Model", "Category", "Assigned To", "Room Number", "Attributes"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(sheetName, cell, header)
	}

	for i, device := range devices {
		row := i + 2

		_ = f.SetCellValue(sheetName, "A"+strconv.Itoa(row), device.Id)
		_ = f.SetCellValue(sheetName, "B"+strconv.Itoa(row), device.Name)
		_ = f.SetCellValue(sheetName, "C"+strconv.Itoa(row), device.Status)
		_ = f.SetCellValue(sheetName, "D"+strconv.Itoa(row), device.Brand.Name)
		_ = f.SetCellValue(sheetName, "E"+strconv.Itoa(row), device.Model.Name)
		_ = f.SetCellValue(sheetName, "F"+strconv.Itoa(row), device.Category.Name)
		_ = f.SetCellValue(sheetName, "G"+strconv.Itoa(row), device.EmployeeFullName)
		_ = f.SetCellValue(sheetName, "H"+strconv.Itoa(row), device.RoomNumber)

		var attributeStrings []string
		attributeStrings = make([]string, 0, len(device.Attributes))
		for _, attr := range device.Attributes {
			name := strings.TrimSpace(attr.Attribute.Name)
			if name == "" {
				name = "Attribute"
			}
			info := strings.TrimSpace(attr.Info)
			if info == "" {
				attributeStrings = append(attributeStrings, name)
			} else {
				attributeStrings = append(attributeStrings, name+": "+info)
			}
		}
		_ = f.SetCellValue(sheetName, "I"+strconv.Itoa(row), strings.Join(attributeStrings, "; "))
	}

	f.SetActiveSheet(index)
	_ = f.DeleteSheet("Sheet1")

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
