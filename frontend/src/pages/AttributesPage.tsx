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

const PAGE_SIZE = 10;

export default function AttributesPage() {
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
      setAttributes(page.items);
      setTotalPages(page.total_pages);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Aýratynlyklar</h2>
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

      <div className="card" style={{ marginBottom: 32, maxWidth: 640 }}>
        <h3 style={{ marginBottom: 16 }}>
          {editId === null ? "Aýratynlyk döret" : `Aýratynlygy üýtget #${editId}`}
        </h3>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Ady</label>
            <input
              required
              placeholder="Ady"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Düşündiriş</label>
            <textarea
              placeholder="Düşündiriş"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">
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
              <th>Düşündiriş</th>
              <th>Hereketler</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td>{a.description}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onEditClick(a)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }}>Üýtget</button>
                    <button onClick={() => onDelete(a.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Poz</button>
                  </div>
                </td>
              </tr>
            ))}
            {attributes.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Aýratynlyklar ýok
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
      </div>
    </div>
  );
}
