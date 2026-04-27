// src/pages/AssignDevicePage.tsx
import { useEffect, useState } from "react";
import { getEmployeesSelected } from "../api/employees";
import { getAvailableDevices, assignDevice } from "../api/devices";
import type {
  SelectedObject
} from "../api/employees";
import type { Device } from "../api/devices";
import { handleApiError } from "../api/client";
import { canAssignDevices } from "../utils/auth";
import SearchableSelect from "../components/SearchableSelect";

export default function AssignDevicePage() {
  const canAssign = canAssignDevices();
  const [employees, setEmployees] = useState<SelectedObject[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [deviceId, setDeviceId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [emps, devs] = await Promise.all([
        getEmployeesSelected(""),
        getAvailableDevices(),
      ]);

      setEmployees(emps);
      setDevices(devs);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canAssign) return;
    loadData();
  }, [canAssign]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAssign) return;
    setSuccess(null);

    if (!employeeId || !deviceId) {
      setError("Işgär we enjam saýlaň");
      return;
    }

    try {
      setError(null);
      await assignDevice({
        device_id: Number(deviceId),
        employee_id: Number(employeeId),
      });
      setSuccess("Enjam üstünlikli berkidildi");
      setDeviceId("");
      await loadData();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  if (!canAssign) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
        <p style={{ color: "var(--text-muted)" }}>Enjam berkitmek üçin degişli rugsat gerek.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Enjamy işgäre berkid</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      {loading && <div>Ýüklenýär...</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <div>
          <label>Işgär:</label>
          <SearchableSelect
            value={employeeId}
            onChange={(value) => setEmployeeId(value ? Number(value) : "")}
            options={employees.map((emp) => ({ value: emp.id, label: emp.name }))}
            emptyOptionLabel="Işgär saýlaň..."
            searchPlaceholder="Işgär ady boýunça filter..."
          />
        </div>

        <div>
          <label>Enjam:</label>
          <SearchableSelect
            value={deviceId}
            onChange={(value) => setDeviceId(value ? Number(value) : "")}
            options={devices.map((dev) => ({ value: dev.id, label: `${dev.name} (#${dev.id})` }))}
            emptyOptionLabel="Enjam saýlaň..."
            searchPlaceholder="Enjam ady boýunça filter..."
          />
        </div>

        <button type="submit" disabled={loading}>
          Berkid
        </button>
      </form>
    </div>
  );
}
