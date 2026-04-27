// src/pages/AvailableDevicesPage.tsx
import { useEffect, useState } from "react";
import { getAvailableDevices } from "../api/devices";
import type {
  Device
} from "../api/devices";
import { handleApiError } from "../api/client";
import { getDeviceStatusLabel } from "../utils/statusUtils";
import { canViewInventory } from "../utils/auth";

export default function AvailableDevicesPage() {
  const canView = canViewInventory();
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
    if (!canView) return;
    load();
  }, [canView]);

  if (!canView) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
        <p style={{ color: "var(--text-muted)" }}>Enjamlary görmek üçin degişli rugsat gerek.</p>
      </div>
    );
  }

  return (
    <div className="page-animate">
      <h2 style={{ marginBottom: 16 }}>Elýeterli enjamlar (ammarda)</h2>

      {error && (
        <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ marginBottom: 16, color: 'var(--text-muted)' }}>Ýüklenýär...</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ady</th>
              <th>Kategoriýa</th>
              <th>Brend</th>
              <th>Model</th>
              <th>Ýagdaýy</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td>{d.category?.name || "-"}</td>
                <td>{d.brand?.name || "-"}</td>
                <td>{d.model?.name || "-"}</td>
                <td>
                  <span className="badge status-success">{getDeviceStatusLabel(d.status)}</span>
                </td>
              </tr>
            ))}
            {devices.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Elýeterli enjam ýok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
