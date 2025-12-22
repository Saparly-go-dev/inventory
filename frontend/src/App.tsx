// src/App.tsx
import { NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import AvailableDevicesPage from "./pages/AvailableDevicesPage";
import AssignDevicePage from "./pages/AssignDevicePage";
import BrandsPage from "./pages/BrandsPage";
import ModelsPage from "./pages/ModelsPage";
import AttributesPage from "./pages/AttributesPage";
import DevicesPage from "./pages/DevicesPage";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-container">
      <header className="app-header justify-center">
        <div className="brand-section">
          <h1>Inventory App</h1>
          <span>Manage assets efficiently</span>
        </div>

        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Dashboard</NavLink>
          <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Employees</NavLink>
          <NavLink to="/devices" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Devices</NavLink>
          <NavLink to="/devices/available" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Available</NavLink>
          <NavLink to="/assign" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Assign</NavLink>
          <NavLink to="/brands" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Brands</NavLink>
          <NavLink to="/models" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Models</NavLink>
          <NavLink to="/attributes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Attributes</NavLink>
        </nav>

        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === "light" ? (
            // Moon Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            // Sun Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/available" element={<AvailableDevicesPage />} />
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
