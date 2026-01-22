// src/pages/DevicesPage.tsx
import { useEffect, useState } from "react";
import {
  getDevicePage,
  createDevice,
  updateDevice,
  deleteDevice,
  cloneDevice,
  importDevices,
  downloadImportTemplate,
  type Device,
  type UpdateDevice,
} from "../api/devices";
import { getBrandsSelected, type SelectedObject as BrandSelected } from "../api/brands";
import { getModelsSelected, type SelectedObject as ModelSelected } from "../api/models";
import { getCategoriesSelected, type SelectedObject as CategorySelected } from "../api/categories";
import { getAttributesSelected, type SelectedObject as AttributeSelected } from "../api/attributes";
import { handleApiError, API_BASE_URL } from "../api/client";
import { getDeviceStatusLabel, STATUS_OPTIONS_MAP } from "../utils/statusUtils";

const PAGE_SIZE = 10;

function getImageUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'in_stock': return 'badge status-success';
    case 'assigned': return 'badge status-primary';
    case 'repair': return 'badge status-warning';
    case 'written_off': return 'badge status-danger';
    default: return 'badge';
  }
};

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
    attributes: [],
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Clone Modal
  const [cloneId, setCloneId] = useState<number | null>(null);
  const [cloneCount, setCloneCount] = useState(1);
  const [showCloneModal, setShowCloneModal] = useState(false);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Lists for dropdowns
  const [brandsList, setBrandsList] = useState<BrandSelected[]>([]);
  const [modelsList, setModelsList] = useState<ModelSelected[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategorySelected[]>([]);
  const [attributesList, setAttributesList] = useState<AttributeSelected[]>([]);

  useEffect(() => {
    Promise.all([
      getBrandsSelected(),
      getCategoriesSelected(),
      getAttributesSelected(),
    ])
      .then(([brands, categories, attributes]) => {
        setBrandsList(brands);
        setCategoriesList(categories);
        setAttributesList(attributes);
      })
      .catch((e) => console.error("Failed to load dropdown options", e));
  }, []);

  useEffect(() => {
    setModelsList([]);
    if (form.brand_id) {
      getModelsSelected(form.brand_id)
        .then(setModelsList)
        .catch((e) => console.error("Failed to load models", e));
    }
  }, [form.brand_id]);

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
      setError("Brend we modeli saýlaň");
      return;
    }

    try {
      setError(null);
      if (editId === null) {
        await createDevice(form, photoFile);
      } else {
        await updateDevice(editId, form, photoFile);
      }
      resetForm();
      setPageNumber(1);
      await loadDevices();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Enjamy pozmak isleýärsiňizmi?")) return;
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
      photo: d.photo,
      attributes: d.attributes?.map(a => ({
        attribute_id: a.attribute_id,
        options: a.options,
        info: a.info
      })) || [],
    });
    setPhotoFile(null);
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
      attributes: [],
    });
    setPhotoFile(null);
  }

  return (
    <div className="page-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Enjamlar</h2>
        <div style={{ width: '300px', display: 'flex', gap: 12 }}>
          <button onClick={() => setShowImportModal(true)} className="btn btn-secondary">
            Excel Import
          </button>
          <input
            type="text"
            placeholder="Enjam ady boýunça gözleg..."
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>
          {editId === null ? "Enjam döret" : `Enjamy üýtget #${editId}`}
        </h3>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Enjamyň ady</label>
              <input
                required
                placeholder="Ady ýazyň"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm text-muted">Ýagdaýy</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value || "in_stock" })}
              >
                {STATUS_OPTIONS_MAP.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Düşündiriş</label>
            <input
              placeholder="Gysgaça düşündiriş"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Giňişleýin maglumat</label>
            <textarea
              placeholder="Goşmaça maglumat"
              value={form.info}
              onChange={(e) => setForm({ ...form, info: e.target.value })}
              rows={3}
            />
          </div>

          {/* Photo Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm text-muted">Surat</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            />

            {form.photo && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <span className="text-sm text-muted">Häzirki surat:</span>
                <img
                  src={getImageUrl(form.photo)}
                  alt="device"
                  onClick={() => setPreviewImage(getImageUrl(form.photo))}
                  style={{
                    height: 60,
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Brend</label>
              <select
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: Number(e.target.value), model_id: 0 })}
              >
                <option value={0} disabled>Brend saýlaň</option>
                {brandsList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Model</label>
              <select
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: Number(e.target.value) })}
                disabled={!form.brand_id}
              >
                <option value={0} disabled>Model saýlaň</option>
                {modelsList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Kategoriýa</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
              >
                <option value={0} disabled>Kategoriýa saýlaň</option>
                {categoriesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Attributes Section */}
          <div style={{ marginTop: 8, padding: 16, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-hover)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="text-sm font-semibold">Aýratynlyklar</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, attributes: [...(form.attributes || []), { attribute_id: 0, options: "", info: "" }] })}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                + Aýratynlyk goş
              </button>
            </div>

            {form.attributes?.map((attr, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select
                  value={attr.attribute_id}
                  onChange={(e) => {
                    const newAttributes = [...(form.attributes || [])];
                    newAttributes[index].attribute_id = Number(e.target.value);
                    setForm({ ...form, attributes: newAttributes });
                  }}
                  style={{ flex: 1 }}
                >
                  <option value={0} disabled>Aýratynlyk saýlaň</option>
                  {attributesList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <input
                  placeholder="Bahasy"
                  value={attr.options}
                  onChange={(e) => {
                    const newAttributes = [...(form.attributes || [])];
                    newAttributes[index].options = e.target.value;
                    setForm({ ...form, attributes: newAttributes });
                  }}
                  style={{ flex: 1 }}
                />
                <input
                  placeholder="Maglumat"
                  value={attr.info}
                  onChange={(e) => {
                    const newAttributes = [...(form.attributes || [])];
                    newAttributes[index].info = e.target.value;
                    setForm({ ...form, attributes: newAttributes });
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAttributes = (form.attributes || []).filter((_, i) => i !== index);
                    setForm({ ...form, attributes: newAttributes });
                  }}
                  className="btn btn-danger"
                  style={{ padding: '0 12px' }}
                >
                  ×
                </button>
              </div>
            ))}
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
              <th>Ýagdaýy</th>
              <th>Brend</th>
              <th>Model</th>
              <th>Kategoriýa</th>
              <th>Surat</th>
              <th>Aýratynlyklar</th>
              <th>Hereketler</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td><span className={statusBadgeClass(d.status)}>{getDeviceStatusLabel(d.status)}</span></td>
                <td>{d.brand.name}</td>
                <td>{d.model.name}</td>
                <td>{d.category.name}</td>
                <td>
                  {d.photo && (
                    <img
                      src={getImageUrl(d.photo)}
                      alt="device"
                      onClick={() => setPreviewImage(getImageUrl(d.photo))}
                      style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--border-color)' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </td>
                <td>
                  {d.attributes && d.attributes.length > 0 ? (
                    <div style={{ fontSize: 13 }}>
                      {d.attributes.map((attr) => {
                        const attrName = attributesList.find((a) => a.id === attr.attribute_id)?.name || "Näsaz";
                        return (
                          <div key={attr.id} style={{ marginBottom: 2 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{attrName}:</span> {attr.options}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onEditClick(d)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }}>Üýtget</button>
                    <button onClick={() => { setCloneId(d.id); setCloneCount(1); setShowCloneModal(true); }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Klon</button>
                    <button onClick={() => onDelete(d.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Poz</button>
                  </div>
                </td>
              </tr>
            ))}
            {devices.length === 0 && !loading && (
              <tr>
                <td colSpan={9} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                  Enjam tapylmady. Ýokarda täzesini dörediň!
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

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: 'blur(4px)',
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
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", backdropFilter: 'blur(4px)',
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="card" style={{ width: 400, background: "var(--bg-card)" }}>
            <h3>Enjamy köpeltmek (Klon)</h3>
            <div style={{ margin: "16px 0" }}>
              <label>Näçe sany nusga gerek?</label>
              <input
                type="number"
                min="1"
                value={cloneCount}
                onChange={(e) => setCloneCount(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowCloneModal(false)}>Ýatyr</button>
              <button className="btn btn-primary" onClick={async () => {
                if (!cloneId || cloneCount <= 0) return;
                try {
                  await cloneDevice(cloneId, cloneCount);
                  setShowCloneModal(false);
                  await loadDevices();
                } catch (e) { setError(handleApiError(e)); }
              }}>Tassykla</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", backdropFilter: 'blur(4px)',
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="card" style={{ width: 500, background: "var(--bg-card)" }}>
            <h3>Excel Import</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              Köp enjamlary birden goşmak üçin Excel faýlyny ulan.
              <br />
              Şablony ýükläp alyň we dolduryň:
              <button className="btn" style={{ marginLeft: 8, padding: '2px 8px', fontSize: 12 }} onClick={downloadImportTemplate}>
                Şablony ýükle
              </button>
            </p>

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Ýatyr</button>
              <button className="btn btn-primary" onClick={async () => {
                if (!importFile) return;
                try {
                  await importDevices(importFile);
                  setShowImportModal(false);
                  await loadDevices();
                } catch (e) { setError(handleApiError(e)); }
              }}>Import et</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
