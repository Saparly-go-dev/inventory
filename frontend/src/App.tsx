// src/App.tsx
import { NavLink, Route, Routes } from "react-router-dom";
import EmployeesPage from "./pages/EmployeesPage";
import AvailableDevicesPage from "./pages/AvailableDevicesPage";
import AssignDevicePage from "./pages/AssignDevicePage";
import BrandsPage from "./pages/BrandsPage";
import ModelsPage from "./pages/ModelsPage"

function App() {
  return (
    <div className="app" style={{ minHeight: "100vh", background: "#111", color: "#f9f9f9" }}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #333" }}>
        <h1 style={{ marginBottom: 8 }}>Inventory Frontend</h1>
        <nav style={{ display: "flex", gap: 16 }}>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/devices/available">Available devices</NavLink>
          <NavLink to="/assign">Assign device</NavLink>
          <NavLink to="/brands">Brands</NavLink>
          <NavLink to="/models">Models</NavLink>
        </nav>

      </header>

      <main style={{ padding: "24px" }}>
       <Routes>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/devices/available" element={<AvailableDevicesPage />} />
        <Route path="/assign" element={<AssignDevicePage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="*" element={<EmployeesPage />} />
        <Route path="/models" element={<ModelsPage />} />
     ` </Routes>

      </main>
    </div>
  );
}

export default App;
