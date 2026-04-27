// src/pages/EmployeesPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployeesPage,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  syncEmployees,
} from "../api/employees";
import type {
  Employee,
  UpdateEmployee
} from "../api/employees";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { canCreateInventory, canDeleteInventory, canSyncEmployees, canUpdateInventory } from "../utils/auth";

const PAGE_SIZE = 10;

export default function EmployeesPage() {
  const navigate = useNavigate();
  const canCreate = canCreateInventory();
  const canUpdate = canUpdateInventory();
  const canDelete = canDeleteInventory();
  const canSync = canSyncEmployees();
  const canWrite = canCreate || canUpdate || canDelete;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateEmployee>({
    full_name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    room_number: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const roomNumbers = roomFilter.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const page = await getEmployeesPage(PAGE_SIZE, pageNumber, search, roomNumbers);
      setEmployees(page.items);
      setTotalPages(getPageCount(page));
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, search, roomFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((editId === null && !canCreate) || (editId !== null && !canUpdate)) return;
    try {
      setError(null);
      if (editId === null) {
        await createEmployee(form);
      } else {
        await updateEmployee(editId, form);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!canDelete) return;
    if (!confirm("Işgäri pozmak isleýärsiňizmi?")) return;
    try {
      setError(null);
      await deleteEmployee(id);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(e: Employee) {
    if (!canUpdate) return;
    setEditId(e.id);
    setForm({
      full_name: e.full_name,
      position: e.position,
      department: e.department,
      email: e.email,
      phone: e.phone,
      room_number: e.room_number,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({
      full_name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      room_number: 0,
    });
  }

  async function onSync() {
    if (!canSync || syncing) return;
    try {
      setSyncing(true);
      setError(null);
      await syncEmployees();
      await load();
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="page-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Işgärler</h2>
        <div style={{ display: 'flex', gap: 12, width: '520px' }}>
          {canSync && (
            <button type="button" className="btn btn-secondary" onClick={onSync} disabled={syncing}>
              {syncing ? "Sync..." : "Sync"}
            </button>
          )}
          <input
            placeholder="Ady boýunça gözleg..."
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            style={{ flex: 1 }}
          />
          <input
            placeholder="Otaglar (mysal: 101,202)..."
            value={roomFilter}
            onChange={(e) => {
              setPageNumber(1);
              setRoomFilter(e.target.value);
            }}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {(canCreate || editId !== null) && (
      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>{editId === null ? "Işgär döret" : `Işgäri üýtget #${editId}`}</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Doly ady (F.A.A)</label>
              <input
                required
                placeholder="Doly ady"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Wezipe</label>
              <input
                placeholder="Wezipe"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Bölüm</label>
              <input
                placeholder="Bölüm"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Email</label>
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Telefon</label>
              <input
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Otag belgisi</label>
              <input
                type="number"
                placeholder="Otag"
                value={form.room_number || ""}
                onChange={(e) => setForm({ ...form, room_number: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">{editId === null ? "Döret" : "Ýatda sakla"}</button>
            {editId !== null && <button type="button" onClick={resetForm} className="btn btn-secondary">Yza</button>}
          </div>
        </form>
      </div>
      )}

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
              <th>Doly ady</th>
              <th>Wezipe</th>
              <th>Bölüm</th>
              <th>Email</th>
              <th>Tel</th>
              <th>Otag</th>
              {canWrite && <th>Hereketler</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} onDoubleClick={() => navigate(`/employees/${e.id}`)} style={{ cursor: "pointer" }}>
                <td>{e.id}</td>
                <td style={{ fontWeight: 500 }}>{e.full_name}</td>
                <td>{e.position}</td>
                <td>{e.department}</td>
                <td>{e.email}</td>
                <td>{e.phone}</td>
                <td>{e.room_number || "-"}</td>
                {canWrite && (
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {canUpdate && <button onClick={(event) => { event.stopPropagation(); onEditClick(e); }} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }}>Üýtget</button>}
                    {canDelete && <button onClick={(event) => { event.stopPropagation(); onDelete(e.id); }} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Poz</button>}
                  </div>
                </td>
                )}
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr>
                <td colSpan={canWrite ? 8 : 7} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Işgärler tapylmady
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
          className="btn btn-secondary"
          style={{ opacity: pageNumber <= 1 ? 0.5 : 1 }}
        >
          Yza
        </button>
        <span style={{ margin: "0 8px", color: 'var(--text-muted)' }}>
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
      </div>
    </div>
  );
}
