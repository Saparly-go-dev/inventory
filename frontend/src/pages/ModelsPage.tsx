// src/pages/ModelsPage.tsx
import { useEffect, useState } from "react";
import {
  getModelPage,
  createModel,
  updateModel,
  deleteModel,
} from "../api/models";

import { handleApiError } from "../api/client";

import type {
  ModelItem,
  UpdateModel
} from "../api/models"
import { getPageCount } from "../api/pagination";
import { canCreateInventory, canDeleteInventory, canUpdateInventory } from "../utils/auth";

import {
  getBrandsSelected,
  type SelectedObject as BrandSelected,
} from "../api/brands";
import SearchableSelect from "../components/SearchableSelect";

const PAGE_SIZE = 10;

export default function ModelsPage() {
  const canCreate = canCreateInventory();
  const canUpdate = canUpdateInventory();
  const canDelete = canDeleteInventory();
  const canWrite = canCreate || canUpdate || canDelete;
  const [models, setModels] = useState<ModelItem[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brands, setBrands] = useState<BrandSelected[]>([]);

  const [form, setForm] = useState<UpdateModel>({
    name: "",
    description: "",
    brand_id: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);

  async function loadModels() {
    try {
      setLoading(true);
      setError(null);
      const page = await getModelPage(PAGE_SIZE, pageNumber, search);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setModels(page.items);
      setTotalPages(pageCount);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadBrands() {
    try {
      const list = await getBrandsSelected("");
      setBrands(list);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadModels();
  }, [pageNumber, search]);

  useEffect(() => {
    loadBrands();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((editId === null && !canCreate) || (editId !== null && !canUpdate)) return;

    if (!form.brand_id) {
      setError("Brend saýlaň");
      return;
    }

    try {
      setError(null);
      if (editId === null) {
        await createModel(form);
      } else {
        await updateModel(editId, form);
      }
      setForm({ name: "", description: "", brand_id: 0 });
      setEditId(null);
      setPageNumber(1);
      await loadModels();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!canDelete) return;
    if (!confirm("Modeli pozmak isleýärsiňizmi?")) return;
    try {
      setError(null);
      await deleteModel(id);
      await loadModels();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(m: ModelItem) {
    if (!canUpdate) return;
    setEditId(m.id);
    setForm({
      name: m.name,
      description: m.description,
      brand_id: m.brand_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({ name: "", description: "", brand_id: 0 });
  }

  return (
    <div className="page-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Modeller</h2>
        <div style={{ width: '300px' }}>
          <input
            placeholder="Model ady boýunça gözleg..."
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {(canCreate || editId !== null) && (
      <div className="card" style={{ marginBottom: 32, maxWidth: 640 }}>
        <h3 style={{ marginBottom: 16 }}>
          {editId === null ? "Model döret" : `Modeli üýtget #${editId}`}
        </h3>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Modeliň ady</label>
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Brend</label>
            <SearchableSelect
              value={form.brand_id || ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  brand_id: value ? Number(value) : 0,
                })
              }
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
              emptyOptionLabel="Brend saýlaň..."
              searchPlaceholder="Brend ady boýunça filter..."
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
              <th>Ady</th>
              <th>Düşündiriş</th>
              <th>Brend</th>
              {canWrite && <th>Hereketler</th>}
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td>{m.description}</td>
                <td>{m.brand.name}</td>
                {canWrite && (
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canUpdate && <button onClick={() => onEditClick(m)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }}>Üýtget</button>}
                    {canDelete && <button onClick={() => onDelete(m.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Poz</button>}
                  </div>
                </td>
                )}
              </tr>
            ))}
            {models.length === 0 && !loading && (
              <tr>
                <td colSpan={canWrite ? 5 : 4} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Modeller tapylmady
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
