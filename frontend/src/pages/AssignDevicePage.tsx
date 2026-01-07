// src/pages/AssignDevicePage.tsx
import { useEffect, useState } from "react";
import { getEmployeesSelected } from "../api/employees";
import { getAvailableDevices, assignDevice } from "../api/devices";
import type {
  SelectedObject
} from "../api/employees";
import type { Device } from "../api/devices";
import { handleApiError } from "../api/client";

export default function AssignDevicePage() {
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
    loadData();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div>
      <h2>Enjamy işgäre berkid</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      {loading && <div>Ýüklenýär...</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <div>
          <label>Işgär:</label>
          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Işgär saýlaň...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Enjam:</label>
          <select
            value={deviceId}
            onChange={(e) =>
              setDeviceId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Enjam saýlaň...</option>
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} (#{dev.id})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          Berkid
        </button>
      </form>
    </div>
  );
}
