// src/pages/AvailableDevicesPage.tsx
import { useEffect, useState } from "react";
import { getAvailableDevices } from "../api/devices";
import type {
  Device
} from "../api/devices";
import { handleApiError } from "../api/client";

export default function AvailableDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableDevices();
      setDevices(data);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Available devices (in_stock)</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>{d.status}</td>
            </tr>
          ))}
          {devices.length === 0 && !loading && (
            <tr>
              <td colSpan={3}>No available devices</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
