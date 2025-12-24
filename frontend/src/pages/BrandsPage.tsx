// src/pages/BrandsPage.tsx
import { useEffect, useState } from "react";
import {
  getBrandPage,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brands";

import type {
  Brand,
  UpdateBrand
} from "../api/brands"
import { handleApiError } from "../api/client";

const PAGE_SIZE = 10;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateBrand>({
    name: "",
    description: "",
    info: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const page = await getBrandPage(PAGE_SIZE, pageNumber, search);

      setBrands(page.items);
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
        await createBrand(form);
      } else {
        await updateBrand(editId, form);
      }
      setForm({ name: "", description: "", info: "" });
      setEditId(null);
      setPageNumber(1);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Brendi pozmak isleýärsiňizmi?")) return;
    try {
      setError(null);
      await deleteBrand(id);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(brand: Brand) {
    setEditId(brand.id);
    setForm({
      name: brand.name,
      description: brand.description,
      info: brand.info,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({ name: "", description: "", info: "" });
  }

  return (
    <div className="page-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Brendler</h2>
        <div style={{ width: '300px' }}>
          <input
            placeholder="Brend gözleg..."
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
          {editId === null ? "Brend döret" : `Brendi üýtget #${editId}`}
        </h3>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Brendiň ady</label>
            <input
              required
              placeholder="Ady"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Düşündiriş</label>
            <input
              placeholder="Düşündiriş"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Goşmaça maglumat</label>
            <textarea
              placeholder="Maglumat"
              value={form.info}
              onChange={(e) => setForm({ ...form, info: e.target.value })}
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
              <th>Maglumat</th>
              <th>Hereketler</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td style={{ fontWeight: 500 }}>{b.name}</td>
                <td>{b.description}</td>
                <td>{b.info}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onEditClick(b)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }}>Üýtget</button>
                    <button onClick={() => onDelete(b.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Poz</button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Brendler ýok
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
