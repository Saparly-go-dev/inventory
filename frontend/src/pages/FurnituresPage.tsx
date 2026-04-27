import { useEffect, useState } from "react";
import { getCategoriesSelected, type SelectedObject as CategorySelected } from "../api/categories";
import {
  createFurniture,
  deleteFurniture,
  getFurniturePage,
  updateFurniture,
  type Furniture,
  type UpdateFurniture,
} from "../api/furnitures";
import { API_BASE_URL, handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { canCreateInventory, canDeleteInventory, canUpdateInventory } from "../utils/auth";
import SearchableSelect from "../components/SearchableSelect";

const PAGE_SIZE = 10;

function getImageUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

export default function FurnituresPage() {
  const canCreate = canCreateInventory();
  const canUpdate = canUpdateInventory();
  const canDelete = canDeleteInventory();
  const [items, setItems] = useState<Furniture[]>([]);
  const [categories, setCategories] = useState<CategorySelected[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState<UpdateFurniture>({
    name: "",
    description: "",
    info: "",
    category_id: 0,
    total_quantity: 1,
    photo: "",
  });

  useEffect(() => {
    getCategoriesSelected()
      .then(setCategories)
      .catch((e) => setError(handleApiError(e)));
  }, []);

  useEffect(() => {
    loadItems();
  }, [pageNumber, search]);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const page = await getFurniturePage(PAGE_SIZE, pageNumber, search);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setItems(page.items);
      setTotalPages(pageCount);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.category_id) {
      setError("Kategoriýa saýlaň");
      return;
    }
    if (form.total_quantity < 0) {
      setError("Mukdar otrisatel bolup bilmez");
      return;
    }

    try {
      setError(null);
      if (editId === null) {
        await createFurniture(form, photoFile);
      } else {
        await updateFurniture(editId, form, photoFile);
      }
      resetForm();
      setPageNumber(1);
      await loadItems();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEdit(item: Furniture) {
    setEditId(item.id);
    setPhotoFile(null);
    setForm({
      name: item.name,
      description: item.description,
      info: item.info,
      category_id: item.category_id,
      total_quantity: item.total_quantity,
      photo: item.photo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("Mebeli pozmak isleýärsiňizmi?")) return;
    try {
      setError(null);
      await deleteFurniture(id);
      await loadItems();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function resetForm() {
    setEditId(null);
    setPhotoFile(null);
    setForm({
      name: "",
      description: "",
      info: "",
      category_id: 0,
      total_quantity: 1,
      photo: "",
    });
  }

  return (
    <div className="page-animate">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Mebeller</h2>
        <input
          type="text"
          placeholder="Mebel ady boýunça gözleg..."
          value={search}
          onChange={(e) => {
            setPageNumber(1);
            setSearch(e.target.value);
          }}
          style={{ width: 300 }}
        />
      </div>

      {error && (
        <div style={{ padding: 12, borderRadius: 6, background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {(canCreate || editId !== null) && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{editId === null ? "Mebel döret" : `Mebeli üýtget #${editId}`}</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label className="text-sm text-muted">Ady</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label className="text-sm text-muted">Kategoriýa</label>
                <SearchableSelect
                  value={form.category_id}
                  onChange={(value) => setForm({ ...form, category_id: Number(value) })}
                  options={categories.map((category) => ({ value: category.id, label: category.name }))}
                  emptyOptionLabel="Kategoriýa saýlaň..."
                  emptyOptionValue={0}
                  searchPlaceholder="Kategoriýa ady boýunça filter..."
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label className="text-sm text-muted">Jemi mukdar</label>
                <input
                  type="number"
                  min={0}
                  value={form.total_quantity}
                  onChange={(e) => setForm({ ...form, total_quantity: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label className="text-sm text-muted">Surat</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                {form.photo && !photoFile && (
                  <img
                    src={getImageUrl(form.photo)}
                    alt={form.name || "Furniture"}
                    style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-color)" }}
                  />
                )}
                {photoFile && (
                  <img
                    src={URL.createObjectURL(photoFile)}
                    alt="Preview"
                    style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-color)" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label className="text-sm text-muted">Düşündiriş</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label className="text-sm text-muted">Goşmaça maglumat</label>
              <textarea rows={3} value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" type="submit">
                {editId === null ? "Döret" : "Ýatda sakla"}
              </button>
              {editId !== null && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Ýatyr
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Surat</th>
              <th>Ady</th>
              <th>Kategoriýa</th>
              <th>Jemi</th>
              <th>Berlen</th>
              <th>Elýeterli</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  {item.photo ? (
                    <img
                      src={getImageUrl(item.photo)}
                      alt={item.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-color)" }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.category?.name || "-"}</td>
                <td>{item.total_quantity}</td>
                <td>{item.allocated_quantity}</td>
                <td>{item.available_quantity}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {canUpdate && <button className="btn btn-secondary" type="button" onClick={() => onEdit(item)}>Üýtget</button>}
                    {canDelete && <button className="btn btn-danger" type="button" onClick={() => onDelete(item.id)}>Poz</button>}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                  Mebel ýok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}>
            Yza
          </button>
          <span style={{ alignSelf: "center" }}>{pageNumber} / {totalPages}</span>
          <button className="btn btn-secondary" type="button" disabled={pageNumber >= totalPages} onClick={() => setPageNumber((p) => p + 1)}>
            Öňe
          </button>
        </div>
      )}
    </div>
  );
}
