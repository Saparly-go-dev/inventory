import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import EmployeesPage from "./pages/EmployeesPage";
import AvailableDevicesPage from "./pages/AvailableDevicesPage";
import AssignDevicePage from "./pages/AssignDevicePage";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import BrandsPage from "./pages/BrandsPage";
import ModelsPage from "./pages/ModelsPage";
import CategoriesPage from "./pages/CategoriesPage";
import AttributesPage from "./pages/AttributesPage";
import DevicesPage from "./pages/DevicesPage";
import StatisticsPage from "./pages/StatisticsPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout theme={theme} setTheme={setTheme} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/devices/available" element={<AvailableDevicesPage />} />
            <Route path="/assign" element={<AssignDevicePage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/attributes" element={<AttributesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
