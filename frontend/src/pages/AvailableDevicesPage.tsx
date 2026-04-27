// src/pages/AvailableDevicesPage.tsx
import { useEffect, useState } from "react";
import { getAvailableDevicesPage } from "../api/devices";
import type {
  Device
} from "../api/devices";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { getDeviceStatusLabel } from "../utils/statusUtils";
import { canViewInventory } from "../utils/auth";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AvailableDevicesPage() {
  const canView = canViewInventory();
  const [devices, setDevices] = useState<Device[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const page = await getAvailableDevicesPage(pageSize, pageNumber);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setDevices(page.items);
      setTotalPages(pageCount);
      setPageInput(String(pageNumber));
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) return;
    load();
  }, [canView, pageNumber, pageSize]);

  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  function goToPage() {
    const nextPage = Number(pageInput);
    if (!Number.isInteger(nextPage) || nextPage < 1) {
      setPageInput(String(pageNumber));
      return;
    }
    setPageNumber(Math.min(nextPage, totalPages));
  }

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

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
          className="btn btn-secondary"
          style={{ opacity: pageNumber <= 1 ? 0.5 : 1 }}
        >
          Yza
        </button>
        <span style={{ color: 'var(--text-muted)' }}>
          Sahypa {pageNumber} / {totalPages}
        </span>
        <button
          disabled={pageNumber >= totalPages}
          onClick={() => setPageNumber((p) => p + 1)}
          className="btn btn-secondary"
          style={{ opacity: pageNumber >= totalPages ? 0.5 : 1 }}
        >
          Öňe
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sahypa geç:</span>
          <input
            type="number"
            min={1}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToPage();
              }
            }}
            style={{ width: 88 }}
          />
          <button type="button" className="btn btn-secondary" onClick={goToPage}>
            Geç
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sahypada:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
