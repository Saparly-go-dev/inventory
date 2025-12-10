// src/App.tsx
import { NavLink, Route, Routes } from "react-router-dom";
import EmployeesPage from "./pages/EmployeesPage";
import AvailableDevicesPage from "./pages/AvailableDevicesPage";
import AssignDevicePage from "./pages/AssignDevicePage";
import BrandsPage from "./pages/BrandsPage";
import ModelsPage from "./pages/ModelsPage";
import AttributesPage from "./pages/AttributesPage";
import DevicesPage from "./pages/DevicesPage";

function App() {
  return (
    <div
      className="app"
      style={{ minHeight: "100vh", background: "#111", color: "#f9f9f9" }}
    >
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4, fontSize: 22 }}>Inventory Frontend</h1>
          <div style={{ fontSize: 13, color: "#aaa" }}>
            Devices, employees, brands, models, attributes
          </div>
        </div>

        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/devices">Devices</NavLink>
          <NavLink to="/devices/available">Available</NavLink>
          <NavLink to="/assign">Assign</NavLink>
          <NavLink to="/brands">Brands</NavLink>
          <NavLink to="/models">Models</NavLink>
          <NavLink to="/attributes">Attributes</NavLink>
        </nav>
      </header>

      <main style={{ padding: "24px" }}>
        <Routes>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route
            path="/devices/available"
            element={<AvailableDevicesPage />}
          />
          <Route path="/assign" element={<AssignDevicePage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/attributes" element={<AttributesPage />} />
          <Route path="*" element={<EmployeesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
