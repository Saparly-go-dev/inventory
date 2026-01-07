package repository

import (
	"inventory/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(
		&models.Device{},
		&models.Brand{},
		&models.Model{},
		&models.Category{},
		&models.Attribute{},
		&models.DeviceAttribute{},
		&models.Employee{},
		&models.DeviceAssignment{},
	)
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	return db
}

func TestDashboardPostgres_GetAllDevices(t *testing.T) {
	db := setupTestDB(t)
	repo := NewDashboardPostgres(db)

	// --- Seed Data ---
	brand1 := models.Brand{Name: "BrandA"}
	db.Create(&brand1)
	model1 := models.Model{Name: "ModelX"}
	db.Create(&model1)
	category1 := models.Category{Name: "Category1"}
	db.Create(&category1)
	attribute1 := models.Attribute{Name: "Color"}
	db.Create(&attribute1)
	attribute2 := models.Attribute{Name: "RAM"}
	db.Create(&attribute2)

	device1 := models.Device{Name: "Device 1", BrandId: brand1.Id, ModelId: model1.Id, CategoryId: category1.Id, Status: "in_stock"}
	db.Create(&device1)
	device2 := models.Device{Name: "Device 2", BrandId: brand1.Id, ModelId: model1.Id, CategoryId: category1.Id, Status: "assigned"}
	db.Create(&device2)
	device3 := models.Device{Name: "Device 3", BrandId: brand1.Id, ModelId: model1.Id, CategoryId: category1.Id, Status: "in_stock"}
	db.Create(&device3)

	// Attributes for devices
	// Device 1: Color=Red, RAM=16GB
	db.Create(&models.DeviceAttribute{DeviceId: device1.Id, AttributeId: attribute1.Id, Options: "Red", Info: "Matte Red"})
	db.Create(&models.DeviceAttribute{DeviceId: device1.Id, AttributeId: attribute2.Id, Options: "16GB"})
	// Device 2: Color=Blue
	db.Create(&models.DeviceAttribute{DeviceId: device2.Id, AttributeId: attribute1.Id, Options: "Blue"})
	// Device 3: RAM=32GB
	db.Create(&models.DeviceAttribute{DeviceId: device3.Id, AttributeId: attribute2.Id, Options: "32GB", Info: "DDR5"})

	// --- Test Cases ---
	strPtr := func(s string) *string { return &s }
	intPtr := func(i int) *int { return &i }

	testCases := []struct {
		name        string
		filters     DeviceFilters
		expectedIDs []int
	}{
		{
			name:        "No filters",
			filters:     DeviceFilters{},
			expectedIDs: []int{device1.Id, device2.Id, device3.Id},
		},
		{
			name:        "Filter by status 'in_stock'",
			filters:     DeviceFilters{Status: strPtr("in_stock")},
			expectedIDs: []int{device1.Id, device3.Id},
		},
		{
			name:        "Filter by attribute ID (Color)",
			filters:     DeviceFilters{AttributeID: intPtr(attribute1.Id)},
			expectedIDs: []int{device1.Id, device2.Id},
		},
		{
			name:        "Filter by attribute options (Red)",
			filters:     DeviceFilters{AttributeOptions: strPtr("Red")},
			expectedIDs: []int{device1.Id},
		},
		{
			name:        "Filter by attribute info (Matte Red)",
			filters:     DeviceFilters{AttributeInfo: strPtr("Matte Red")},
			expectedIDs: []int{device1.Id},
		},
		{
			name:        "Filter by attribute ID (RAM) and options (16GB)",
			filters:     DeviceFilters{AttributeID: intPtr(attribute2.Id), AttributeOptions: strPtr("16GB")},
			expectedIDs: []int{device1.Id},
		},
		{
			name:        "Filter by attribute ID (RAM) and info (DDR5)",
			filters:     DeviceFilters{AttributeID: intPtr(attribute2.Id), AttributeInfo: strPtr("DDR5")},
			expectedIDs: []int{device3.Id},
		},
		{
			name:        "Filter by non-existent attribute info",
			filters:     DeviceFilters{AttributeInfo: strPtr("Non-existent")},
			expectedIDs: []int{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			devices, err := repo.GetAllDevices(tc.filters)
			assert.NoError(t, err)

			returnedIDs := make([]int, len(devices))
			for i, d := range devices {
				returnedIDs[i] = d.Id
			}

			assert.ElementsMatch(t, tc.expectedIDs, returnedIDs, "Mismatch in returned device IDs")
		})
	}
}
