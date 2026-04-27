// src/pages/AttributesPage.tsx
import { useEffect, useState } from "react";
import {
  getAttributePage,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  type Attribute,
  type UpdateAttribute,
} from "../api/attributes";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { canCreateInventory, canDeleteInventory, canUpdateInventory } from "../utils/auth";

const PAGE_SIZE = 10;

export default function AttributesPage() {
  const canCreate = canCreateInventory();
  const canUpdate = canUpdateInventory();
  const canDelete = canDeleteInventory();
  const canWrite = canCreate || canUpdate || canDelete;
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateAttribute>({
    name: "",
    description: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const page = await getAttributePage(PAGE_SIZE, pageNumber, search);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setAttributes(page.items);
      setTotalPages(pageCount);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [pageNumber, search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((editId === null && !canCreate) || (editId !== null && !canUpdate)) return;

    try {
      setError(null);

      if (editId === null) {
        await createAttribute(form);
      } else {
        await updateAttribute(editId, form);
      }

      setForm({ name: "", description: "" });
      setEditId(null);
      setPageNumber(1);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!canDelete) return;
    if (!confirm("Aýratynlygy pozmak isleýärsiňizmi?")) return;

    try {
      setError(null);
      await deleteAttribute(id);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(a: Attribute) {
    if (!canUpdate) return;
    setEditId(a.id);
    setForm({
      name: a.name,
      description: a.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({ name: "", description: "" });
  }

  return (
    <div className="page-animate">
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div></div> {/* Spacer for alignment or future actions */}
        <div style={{ width: '300px' }}>
          <input
            placeholder="Gözleg..."
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: (canCreate || editId !== null) ? 'minmax(300px, 1fr) 2fr' : '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* Form Column */}
        {(canCreate || editId !== null) && (
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <h3 style={{ marginBottom: 20, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editId === null ? (
              <>
                <span style={{ fontSize: '20px' }}>+</span> Aýratynlyk döret
              </>
            ) : `Üýtget #${editId}`}
          </h3>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Ady</label>
              <input
                required
                placeholder="Mysal: Reňk"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Düşündiriş</label>
              <textarea
                placeholder="Aýratynlyk barada..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                style={{ resize: "vertical", minHeight: '100px' }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editId === null ? "Döret" : "Ýatda sakla"}
              </button>

              {editId !== null && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Yza
                </button>
              )}
            </div>
          </form>
        </div>
        )}

        {/* List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          {loading && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Ýüklenýär...</div>}

          <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '25%' }}>Ady</th>
                  <th>Düşündiriş</th>
                  {canWrite && <th style={{ width: '140px', textAlign: 'right' }}>Hereketler</th>}
                </tr>
              </thead>
              <tbody>
                {attributes.map((a) => (
                  <tr key={a.id}>
                    <td><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{a.id}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{a.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.description || '-'}</td>
                    {canWrite && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {canUpdate && <button onClick={() => onEditClick(a)} className="btn btn-secondary" style={{ padding: '6px', width: '32px', height: '32px' }} title="Üýtget">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>}
                        {canDelete && <button onClick={() => onDelete(a.id)} className="btn btn-secondary" style={{ padding: '6px', width: '32px', height: '32px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Poz">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
                {attributes.length === 0 && !loading && (
                  <tr>
                    <td colSpan={canWrite ? 4 : 3} style={{ padding: 48, textAlign: "center", color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <svg width="48" height="48" stroke="currentColor" fill="none" viewBox="0 0 24 24" style={{ opacity: 0.2 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Aýratynlyklar ýok
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => p - 1)}
              className="btn btn-secondary"
              style={{ opacity: pageNumber <= 1 ? 0.5 : 1 }}
            >
              Yza
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
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
      </div>
    </div>
  );
}
