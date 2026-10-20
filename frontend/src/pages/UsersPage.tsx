import { useCallback, useEffect, useState } from "react";
import {
  changeUserPassword,
  changeUserStatus,
  createUser,
  deleteUser,
  getUserPage,
  updateUser,
  type User,
  type UserFilters,
  type UserForm,
} from "../api/users";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { getRolesSelected, type SelectedRole } from "../api/roles";
import SearchableSelect from "../components/SearchableSelect";
import PasswordInput from "../components/PasswordInput";
import { canManageUsers, normalizeRole, ROLE_OPTIONS } from "../utils/auth";

const PAGE_SIZE = 10;

const emptyForm: UserForm = {
  name: "",
  surname: "",
  patronymic: "",
  username: "",
  role: "viewer",
  password: "",
  confirm_password: "",
};

export default function UsersPage() {
  const canManage = canManageUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const [roleOptions, setRoleOptions] = useState<SelectedRole[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm_password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!canManage) return;
    try {
      setLoading(true);
      setError(null);
      const page = await getUserPage(PAGE_SIZE, pageNumber, filters);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setUsers(page.items);
      setTotalPages(pageCount);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }, [canManage, filters, pageNumber]);

  const loadRoles = useCallback(async () => {
    if (!canManage) return;

    try {
      const roles = await getRolesSelected();
      setRoleOptions(roles);
    } catch (e) {
      setError(handleApiError(e));
      setRoleOptions(ROLE_OPTIONS.map((role) => ({ code: role.value, name: role.label })));
    }
  }, [canManage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function getRoleName(code: string) {
    const normalized = normalizeRole(code);
    return roleOptions.find((role) => normalizeRole(role.code) === normalized)?.name ||
      ROLE_OPTIONS.find((role) => role.value === normalized)?.label ||
      normalized;
  }

  function updateFilter(key: keyof UserFilters, value: string) {
    setPageNumber(1);
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
  }

  function resetPasswordForm() {
    setPasswordUser(null);
    setPasswordForm({ password: "", confirm_password: "" });
  }

  function onEditClick(user: User) {
    setEditId(user.id);
    setForm({
      name: user.name || "",
      surname: user.surname || "",
      patronymic: user.patronymic || "",
      username: user.username || "",
      role: normalizeRole(user.role),
      password: "",
      confirm_password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editId === null) {
        if (!form.password || !form.confirm_password) {
          throw new Error("Açar sözi giriziň");
        }
        await createUser(form);
        setSuccess("Ulanyjy döredildi");
      } else {
        await updateUser(editId, {
          name: form.name,
          surname: form.surname,
          patronymic: form.patronymic,
          username: form.username,
          role: form.role,
        });
        setSuccess("Ulanyjy täzelendi");
      }

      resetForm();
      setPageNumber(1);
      await loadUsers();
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    if (!canManage) return;
    if (!confirm("Ulanyjyny pozmak isleýärsiňizmi?")) return;

    try {
      setError(null);
      setSuccess(null);
      await deleteUser(id);
      setSuccess("Ulanyjy pozuldy");
      await loadUsers();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onStatusToggle(id: number) {
    if (!canManage) return;
    try {
      setError(null);
      setSuccess(null);
      await changeUserStatus(id);
      setSuccess("Ulanyjy statusy üýtgedildi");
      await loadUsers();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage || !passwordUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await changeUserPassword({
        user_id: passwordUser.id,
        password: passwordForm.password,
        confirm_password: passwordForm.confirm_password,
      });
      setSuccess("Açar sözi üýtgedildi");
      resetPasswordForm();
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
        <p style={{ color: "var(--text-muted)" }}>Ulanyjy dolandyryşy diňe administrator üçin elýeterli.</p>
      </div>
    );
  }

  return (
    <div className="page-animate">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16 }}>
        <h2>Ulanyjylar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 10, flex: 1, maxWidth: 760 }}>
          <input placeholder="Ady" value={filters.name || ""} onChange={(e) => updateFilter("name", e.target.value)} />
          <input placeholder="Familiýasy" value={filters.surname || ""} onChange={(e) => updateFilter("surname", e.target.value)} />
          <input placeholder="Atasynyň ady" value={filters.patronymic || ""} onChange={(e) => updateFilter("patronymic", e.target.value)} />
          <input placeholder="Username" value={filters.username || ""} onChange={(e) => updateFilter("username", e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{editId === null ? "Ulanyjy döret" : `Ulanyjyny üýtget #${editId}`}</h3>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Ady</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Familiýasy</label>
              <input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Atasynyň ady</label>
              <input value={form.patronymic} onChange={(e) => setForm({ ...form, patronymic: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Username</label>
              <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Rol</label>
              <SearchableSelect
                value={form.role}
                onChange={(value) => setForm({ ...form, role: normalizeRole(value) })}
                options={(roleOptions.length > 0 ? roleOptions : ROLE_OPTIONS.map((role) => ({ code: role.value, name: role.label }))).map((role) => ({
                  value: role.code,
                  label: role.name,
                  searchText: `${role.name} ${normalizeRole(role.code)}`,
                }))}
                searchPlaceholder="Rol ady ýa-da kody boýunça filter..."
              />
            </div>
            {editId === null && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="text-sm text-muted">Açar sözi</label>
                  <PasswordInput
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="text-sm text-muted">Açar sözi tassykla</label>
                  <PasswordInput
                    required
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saklanýar..." : editId === null ? "Döret" : "Ýatda sakla"}
            </button>
            {editId !== null && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Yza
              </button>
            )}
          </div>
        </form>
      </div>

      {success && (
        <div style={{ padding: 12, borderRadius: 6, background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", marginBottom: 16 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: 12, borderRadius: 6, background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ marginBottom: 16, color: "var(--text-muted)" }}>Ýüklenýär...</div>}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ady</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Döredildi</th>
                <th>Täzelendi</th>
                <th>Hereketler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {[user.surname, user.name, user.patronymic].filter(Boolean).join(" ") || "-"}
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{getRoleName(user.role)}</td>
                  <td>
                    <span
                      className={`badge ${user.status ? "status-success" : "status-warning"}`}
                      style={{ border: "none" }}
                    >
                      {user.status ? "Işjeň" : "Öçürilen"}
                    </span>
                  </td>
                  <td>{user.created_at}</td>
                  <td>{user.updated_at}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onEditClick(user)} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }}>
                        Üýtget
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordUser(user);
                          setPasswordForm({ password: "", confirm_password: "" });
                        }}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        Parol
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatusToggle(user.id)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        {user.status ? "Öçür" : "Işjeňleşdir"}
                      </button>
                      <button onClick={() => onDelete(user.id)} className="btn btn-danger" style={{ padding: "4px 8px", fontSize: 12 }}>
                        Poz
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Ulanyjy tapylmady
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
          className="btn btn-secondary"
          style={{ opacity: pageNumber <= 1 ? 0.5 : 1 }}
        >
          Yza
        </button>
        <span style={{ color: "var(--text-muted)" }}>
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

      {passwordUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: 420, background: "var(--bg-card)" }}>
            <h3 style={{ marginBottom: 16 }}>Paroly üýtget: {passwordUser.username}</h3>
            <form onSubmit={onPasswordSubmit} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-sm text-muted">Täze açar sözi</label>
                <PasswordInput
                  required
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-sm text-muted">Tassykla</label>
                <PasswordInput
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={resetPasswordForm}>
                  Ýatyr
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saklanýar..." : "Ýatda sakla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
