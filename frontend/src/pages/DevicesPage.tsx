// src/pages/DevicesPage.tsx
import { useEffect, useState } from "react";
import {
  getDevicePage,
  createDevice,
  updateDevice,
  deleteDevice,
  type Device,
  type UpdateDevice,
} from "../api/devices";
import { getBrandsSelected, type SelectedObject as BrandSelected } from "../api/brands";
import { getModelsSelected, type SelectedObject as ModelSelected } from "../api/models";
import { getCategoriesSelected, type SelectedObject as CategorySelected } from "../api/categories";
import { handleApiError, API_BASE_URL } from "../api/client";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["in_stock", "assigned", "repair", "written_off"];

function getImageUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateDevice>({
    name: "",
    description: "",
    info: "",
    status: "in_stock",
    brand_id: 0,
    model_id: 0,
    category_id: 0,
    photo: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Lists for dropdowns
  const [brandsList, setBrandsList] = useState<BrandSelected[]>([]);
  const [modelsList, setModelsList] = useState<ModelSelected[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategorySelected[]>([]);

  useEffect(() => {
    // Load initial dropdown options (Brands, Categories)
    // Models will be loaded when a brand is selected
    Promise.all([
      getBrandsSelected(),
      getCategoriesSelected(),
    ])
      .then(([brands, categories]) => {
        setBrandsList(brands);
        setCategoriesList(categories);
      })
      .catch((e) => console.error("Failed to load dropdown options", e));
  }, []);

  // When brand_id changes, load models
  useEffect(() => {
    setModelsList([]); // Clear models when brand changes
    if (form.brand_id) {
      // If we are editing (editId !== null) and just loaded the form with a model_id,
      // we might want to preserve it. But if user manually changed brand, we should reset model.
      // For simplicity, we just load valid models for this brand.
      getModelsSelected(form.brand_id)
        .then(setModelsList)
        .catch((e) => console.error("Failed to load models", e));
    }
  }, [form.brand_id]);

  // If user changed brand manually, we might want to reset model_id if it's not valid for new brand.
  // But strictly speaking, the useEffect above just reloads the list. 
  // If the currently selected model_id is not in the new list, the select will probably show nothing or first option.
  // Let's reset model_id in the onChange handler, it's safer.

  async function loadDevices() {
    try {
      setLoading(true);
      setError(null);
      const page = await getDevicePage(PAGE_SIZE, pageNumber, search);
      setDevices(page.items);
      setTotalPages(page.total_pages);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, [pageNumber, search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.brand_id || !form.model_id) {
      setError("Select brand_id and model_id");
      return;
    }

    try {
      setError(null);

      if (editId === null) {
        await createDevice(form, photoFile);
      } else {
        await updateDevice(editId, form, photoFile);
      }

      setForm({
        name: "",
        description: "",
        info: "",
        status: "in_stock",
        brand_id: 0,
        model_id: 0,
        category_id: 0,
        photo: "",
      });
      setPhotoFile(null);
      setEditId(null);
      setPageNumber(1);
      await loadDevices();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete device?")) return;

    try {
      setError(null);
      await deleteDevice(id);
      await loadDevices();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(d: Device) {
    setEditId(d.id);
    setForm({
      name: d.name,
      description: d.description,
      info: d.info,
      status: d.status,
      brand_id: d.brand_id,
      model_id: d.model_id,
      category_id: d.category_id,
      photo: d.photo, // текущий путь к фото
    });
    setPhotoFile(null); // пока не выбрали новое фото
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      info: "",
      status: "in_stock",
      brand_id: 0,
      model_id: 0,
      category_id: 0,
      photo: "",
    });
    setPhotoFile(null);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Devices</h2>

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
          placeholder="Search by device name..."
          value={search}
          onChange={(e) => {
            setPageNumber(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          marginBottom: 24,
          display: "grid",
          gap: 8,
          maxWidth: 640,
          padding: 16,
          borderRadius: 8,
          background: "#181818",
          border: "1px solid #333",
        }}
      >
        <h3 style={{ marginBottom: 4 }}>
          {editId === null ? "Create device" : `Edit device #${editId}`}
        </h3>

        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 1fr",
            columnGap: 12,
          }}
        >
          <input
            required
            placeholder="Device name"
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

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value || "in_stock" })
            }
            style={{
              padding: 6,
              borderRadius: 4,
              border: "1px solid #444",
              background: "#222",
              color: "#eee",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            style={{
              gridColumn: "1 / -1",
              padding: 6,
              borderRadius: 4,
              border: "1px solid #444",
              background: "#222",
              color: "#eee",
            }}
          />
        </div>

        <textarea
          placeholder="Info"
          value={form.info}
          onChange={(e) => setForm({ ...form, info: e.target.value })}
          rows={3}
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
            resize: "vertical",
          }}
        />

        {/* загрузка фото */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 4,
          }}
        >
          <label style={{ fontSize: 13, color: "#ccc" }}>Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPhotoFile(e.target.files && e.target.files[0]
                ? e.target.files[0]
                : null)
            }
            style={{
              padding: 4,
              borderRadius: 4,
              border: "1px solid #444",
              background: "#222",
              color: "#eee",
            }}
          />

          {/* превью, если есть путь и сейчас редактируем */}
          {form.photo && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#aaa" }}>Current photo:</div>
              {/* если нужно через бэкенд-сервер, можно потом поменять src на http://localhost:8080/<path> */}
              <img
                src={getImageUrl(form.photo)}
                alt="device"
                onClick={() => setPreviewImage(getImageUrl(form.photo))}
                style={{
                  maxHeight: 80,
                  borderRadius: 4,
                  border: "1px solid #444",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onError={(e) => {
                  // если путь не резолвится — просто прячем картинку
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span style={{ fontSize: 11, color: "#666" }}>{form.photo}</span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#aaa" }}>Brand</label>
            <select
              value={form.brand_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand_id: Number(e.target.value),
                  model_id: 0, // Reset model when brand changes
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
              <option value={0} disabled>Select Brand</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#aaa" }}>Model</label>
            <select
              value={form.model_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  model_id: Number(e.target.value),
                })
              }
              style={{
                padding: 6,
                borderRadius: 4,
                border: "1px solid #444",
                background: "#222",
                color: "#eee",
              }}
              disabled={!form.brand_id} // Disable if no brand selected
            >
              <option value={0} disabled>Select Model</option>
              {modelsList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#aaa" }}>Category</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  category_id: Number(e.target.value),
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
              <option value={0} disabled>Select Category</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>



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
      </form >

      {error && (
        <div style={{ color: "tomato", marginBottom: 12 }}>{error}</div>
      )
      }
      {loading && <div>Loading...</div>}

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
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Name
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Status
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Brand
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Model
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Categor
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Photo
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.id}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.status}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.brand.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.model.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.category.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {d.photo && (
                  <img
                    src={getImageUrl(d.photo)}
                    alt="device"
                    onClick={() => setPreviewImage(getImageUrl(d.photo))}
                    style={{
                      maxHeight: 40,
                      borderRadius: 4,
                      border: "1px solid #444",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                <button
                  onClick={() => onEditClick(d)}
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
                  onClick={() => onDelete(d.id)}
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
          {devices.length === 0 && !loading && (
            <tr>
              <td colSpan={8} style={{ padding: 8, textAlign: "center" }}>
                No devices
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      {
        previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: 8,
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                border: "1px solid #444",
              }}
            />
          </div>
        )
      }
    </div >
  );
}
