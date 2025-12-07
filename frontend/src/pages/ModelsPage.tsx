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

import {
  getBrandsSelected,
  type SelectedObject as BrandSelected,
} from "../api/brands";

const PAGE_SIZE = 10;

export default function ModelsPage() {
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
      setModels(page.items);
      setTotalPages(page.total_pages);
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
      // бренды не критичны для загрузки таблицы, поэтому без жёсткого newError
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

    if (!form.brand_id) {
      setError("Select brand");
      return;
    }

    try {
      setError(null);
      if (editId === null) {
        await createModel(form);
      } else {
        await updateModel(editId, form);
      }
      // reset
      setForm({ name: "", description: "", brand_id: 0 });
      setEditId(null);
      setPageNumber(1);
      await loadModels();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete model?")) return;
    try {
      setError(null);
      await deleteModel(id);
      await loadModels();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(m: ModelItem) {
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

  console.log(models)

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Models</h2>

      {/* поиск */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
          }}
          placeholder="Search by model name..."
          value={search}
          onChange={(e) => {
            setPageNumber(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* форма создания/редактирования */}
      <form
        onSubmit={onSubmit}
        style={{
          marginBottom: 24,
          display: "grid",
          gap: 8,
          maxWidth: 480,
          padding: 16,
          borderRadius: 8,
          background: "#181818",
          border: "1px solid #333",
        }}
      >
        <h3 style={{ marginBottom: 4 }}>
          {editId === null ? "Create model" : `Edit model #${editId}`}
        </h3>

        <input
          required
          placeholder="Model name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
          }}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
          }}
        />

        <select
          value={form.brand_id || ""}
          onChange={(e) =>
            setForm({
              ...form,
              brand_id: e.target.value ? Number(e.target.value) : 0,
            })
          }
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
          }}
        >
          <option value="">Select brand...</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {editId === null ? "Create" : "Save"}
          </button>

          {editId !== null && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #555",
                background: "transparent",
                color: "#eee",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div style={{ color: "tomato", marginBottom: 12 }}>{error}</div>}
      {loading && <div>Loading...</div>}

      {/* таблица моделей */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#181818",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ background: "#222" }}>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>ID</th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Name</th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Description
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Brand
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {m.id}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {m.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {m.description}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {m.brand.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                <button
                  onClick={() => onEditClick(m)}
                  style={{
                    marginRight: 8,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "none",
                    background: "#10b981",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(m.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {models.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: 8, textAlign: "center" }}>
                No models
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* пагинация */}
      <div style={{ marginTop: 16 }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
          style={{
            padding: "4px 10px",
            marginRight: 8,
            borderRadius: 4,
            border: "1px solid #555",
            background: "#222",
            color: "#eee",
          }}
        >
          Prev
        </button>
        <span>
          Page {pageNumber} / {totalPages}
        </span>
        <button
          disabled={pageNumber >= totalPages}
          onClick={() => setPageNumber((p) => p + 1)}
          style={{
            padding: "4px 10px",
            marginLeft: 8,
            borderRadius: 4,
            border: "1px solid #555",
            background: "#222",
            color: "#eee",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
