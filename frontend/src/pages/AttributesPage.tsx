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
      // если у пагинатора другие поля — подправь здесь
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
    if (!confirm("Delete attribute?")) return;

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
    <div>
      <h2 style={{ marginBottom: 16 }}>Attributes</h2>

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
          placeholder="Search by attribute name..."
          value={search}
          onChange={(e) => {
            setPageNumber(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* форма создания / редактирования */}
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
          {editId === null ? "Create attribute" : `Edit attribute #${editId}`}
        </h3>

        <input
          required
          placeholder="Attribute name"
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

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
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

      {error && (
        <div style={{ color: "tomato", marginBottom: 12 }}>{error}</div>
      )}
      {loading && <div>Loading...</div>}

      {/* таблица атрибутов */}
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
              Description
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((a) => (
            <tr key={a.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {a.id}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {a.name}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                {a.description}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                <button
                  onClick={() => onEditClick(a)}
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
                  onClick={() => onDelete(a.id)}
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
          {attributes.length === 0 && !loading && (
            <tr>
              <td colSpan={4} style={{ padding: 8, textAlign: "center" }}>
                No attributes
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
