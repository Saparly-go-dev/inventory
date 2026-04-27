import { useEffect, useState } from "react";
import {
    getCategoryPage,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesSelected,
    type Category,
    type UpdateCategory,
    type SelectedObject,
} from "../api/categories";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { canCreateInventory, canDeleteInventory, canUpdateInventory } from "../utils/auth";
import SearchableSelect from "../components/SearchableSelect";

const PAGE_SIZE = 10;

export default function CategoriesPage() {
    const canCreate = canCreateInventory();
    const canUpdate = canUpdateInventory();
    const canDelete = canDeleteInventory();
    const canWrite = canCreate || canUpdate || canDelete;
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parent category dropdown options
    const [parentList, setParentList] = useState<SelectedObject[]>([]); // Assuming SelectedObject is {id, name}

    const [form, setForm] = useState<UpdateCategory>({
        name: "",
        description: "",
        info: "",
        icon: "",
        parent_id: null,
    });
    const [editId, setEditId] = useState<number | null>(null);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);
            const page = await getCategoryPage(PAGE_SIZE, pageNumber, search);
            const pageCount = getPageCount(page);
            if (pageNumber > pageCount) {
                setTotalPages(pageCount);
                setPageNumber(pageCount);
                return;
            }
            setCategories(page.items);
            setTotalPages(pageCount);
        } catch (e) {
            setError(handleApiError(e));
        } finally {
            setLoading(false);
        }
    }

    async function loadParents() {
        try {
            const list = await getCategoriesSelected();
            setParentList(list);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        loadData();
    }, [pageNumber, search]);

    useEffect(() => {
        loadParents();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if ((editId === null && !canCreate) || (editId !== null && !canUpdate)) return;

        try {
            setError(null);
            if (editId === null) {
                await createCategory(form);
            } else {
                await updateCategory(editId, form);
            }
            resetForm();
            setPageNumber(1);
            await loadData();
            await loadParents(); // Refresh parent list in case name changed or new category added
        } catch (e) {
            setError(handleApiError(e));
        }
    }

    async function onDelete(id: number) {
        if (!canDelete) return;
        if (!confirm("Kategoriýany pozmak isleýärsiňizmi?")) return;
        try {
            setError(null);
            await deleteCategory(id);
            await loadData();
            await loadParents(); // Refresh parent list
        } catch (e) {
            setError(handleApiError(e));
        }
    }

    function onEditClick(c: Category) {
        if (!canUpdate) return;
        setEditId(c.id);
        setForm({
            name: c.name,
            description: c.description,
            info: c.info,
            icon: c.icon,
            parent_id: c.parent_id || null, // Ensure explicit null
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setEditId(null);
        setForm({ name: "", description: "", info: "", icon: "", parent_id: null });
    }

    return (
        <div className="page-animate">
            {/* Header / Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div></div>
                <div style={{ width: '300px' }}>
                    <input
                        placeholder="Ady boýunça gözleg..."
                        value={search}
                        onChange={(e) => {
                            setPageNumber(1);
                            setSearch(e.target.value);
                        }}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: (canCreate || editId !== null) ? 'minmax(320px, 1fr) 2fr' : '1fr', gap: '24px', alignItems: 'start' }}>

                {/* Form Section */}
                {(canCreate || editId !== null) && (
                <div className="card" style={{ position: 'sticky', top: '80px' }}>
                    <h3 style={{ marginBottom: 20, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {editId === null ? (
                            <>
                                <span style={{ fontSize: '20px' }}>+</span> Kategoriýa döret
                            </>
                        ) : `Üýtget #${editId}`}
                    </h3>

                    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="text-sm text-muted">Kategoriýa ady</label>
                            <input
                                required
                                placeholder="Mysal: Kompýuterler"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="text-sm text-muted">Parent kategoriýa</label>
                            <SearchableSelect
                                value={form.parent_id || 0}
                                onChange={(value) =>
                                    setForm({
                                        ...form,
                                        parent_id: value && value !== "0" ? Number(value) : null,
                                    })
                                }
                                options={parentList.map((p) => ({ value: p.id, label: p.name }))}
                                emptyOptionLabel="- Ýok (Root) -"
                                emptyOptionValue={0}
                                searchPlaceholder="Kategoriýa ady boýunça filter..."
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="text-sm text-muted">Düşündiriş</label>
                            <input
                                placeholder="Gysgaça düşündiriş"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="text-sm text-muted">Goşmaça (Info)</label>
                                <input
                                    placeholder="Info"
                                    value={form.info}
                                    onChange={(e) => setForm({ ...form, info: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="text-sm text-muted">Nyshany (Icon)</label>
                                <input
                                    placeholder="fa-users..."
                                    value={form.icon}
                                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
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

                {/* List Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                            {error}
                        </div>
                    )}

                    {loading && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Ýüklenýär...</div>}

                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>ID</th>
                                    <th>Ady</th>
                                    <th>Parent</th>
                                    <th>Info</th>
                                    {canWrite && <th style={{ width: '100px', textAlign: 'right' }}>Hereketler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c.id}>
                                        <td><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{c.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {c.icon && <i className={c.icon} style={{ color: 'var(--primary)', opacity: 0.8 }}></i>}
                                                <span style={{ fontWeight: 600 }}>{c.name}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description}</div>
                                        </td>
                                        <td>
                                            {c.parent ? (
                                                <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                                    {c.parent.name}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Root</span>
                                            )}
                                        </td>
                                        <td>{c.info || '-'}</td>
                                        {canWrite && (
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                {canUpdate && <button onClick={() => onEditClick(c)} className="btn btn-secondary" style={{ padding: '6px', width: '32px', height: '32px' }} title="Üýtget">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>}
                                                {canDelete && <button onClick={() => onDelete(c.id)} className="btn btn-secondary" style={{ padding: '6px', width: '32px', height: '32px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Poz">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>}
                                            </div>
                                        </td>
                                        )}
                                    </tr>
                                ))}
                                {categories.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={canWrite ? 5 : 4} style={{ padding: 48, textAlign: "center", color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                <svg width="48" height="48" stroke="currentColor" fill="none" viewBox="0 0 24 24" style={{ opacity: 0.2 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                                Kategoriýalar tapylmady
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
