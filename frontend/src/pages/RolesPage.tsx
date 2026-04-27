import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createRole,
  deleteRole,
  getRolePage,
  updateRole,
  type Role,
  type RoleForm,
} from "../api/roles";
import { handleApiError } from "../api/client";
import { getPageCount } from "../api/pagination";
import { canManageRoles, type PermissionKey } from "../utils/auth";

const PAGE_SIZE = 10;

type PermissionItem = {
  key: PermissionKey;
  label: string;
};

const permissionGroups: Array<{ title: string; items: PermissionItem[] }> = [
  {
    title: "Ulgam",
    items: [
      { key: "can_manage_users", label: "Ulanyjylary dolandyrmak" },
      { key: "can_manage_roles", label: "Rollary dolandyrmak" },
    ],
  },
  {
    title: "Inwentar",
    items: [
      { key: "can_view_inventory", label: "Inwentary görmek" },
      { key: "can_create_inventory", label: "Inwentar döretmek" },
      { key: "can_update_inventory", label: "Inwentary üýtgetmek" },
      { key: "can_delete_inventory", label: "Inwentary pozmak" },
    ],
  },
  {
    title: "Enjam hereketleri",
    items: [
      { key: "can_assign_devices", label: "Enjamy berkitmek" },
      { key: "can_return_devices", label: "Enjamy aýyrmak" },
      { key: "can_import_devices", label: "Excel import" },
      { key: "can_export_devices", label: "Excel export" },
      { key: "can_clone_devices", label: "Klon döretmek" },
    ],
  },
  {
    title: "Goşmaça",
    items: [
      { key: "can_sync_employees", label: "Işgärleri sync etmek" },
      { key: "can_view_statistics", label: "Statistikany görmek" },
    ],
  },
];

const permissionItems = permissionGroups.flatMap((group) => group.items);

const emptyForm: RoleForm = {
  code: "",
  name: "",
  description: "",
  can_manage_users: false,
  can_manage_roles: false,
  can_view_inventory: true,
  can_create_inventory: false,
  can_update_inventory: false,
  can_delete_inventory: false,
  can_assign_devices: false,
  can_return_devices: false,
  can_import_devices: false,
  can_export_devices: true,
  can_clone_devices: false,
  can_sync_employees: false,
  can_view_statistics: true,
  can_manage_inventory: false,
  can_view: false,
};

function formFromRole(role: Role): RoleForm {
  return {
    code: role.code,
    name: role.name,
    description: role.description,
    can_manage_users: role.can_manage_users,
    can_manage_roles: role.can_manage_roles,
    can_view_inventory: role.can_view_inventory,
    can_create_inventory: role.can_create_inventory,
    can_update_inventory: role.can_update_inventory,
    can_delete_inventory: role.can_delete_inventory,
    can_assign_devices: role.can_assign_devices,
    can_return_devices: role.can_return_devices,
    can_import_devices: role.can_import_devices,
    can_export_devices: role.can_export_devices,
    can_clone_devices: role.can_clone_devices,
    can_sync_employees: role.can_sync_employees,
    can_view_statistics: role.can_view_statistics,
    can_manage_inventory: false,
    can_view: false,
  };
}

function allRightsForm(form: RoleForm): RoleForm {
  return {
    ...form,
    can_manage_users: true,
    can_manage_roles: true,
    can_view_inventory: true,
    can_create_inventory: true,
    can_update_inventory: true,
    can_delete_inventory: true,
    can_assign_devices: true,
    can_return_devices: true,
    can_import_devices: true,
    can_export_devices: true,
    can_clone_devices: true,
    can_sync_employees: true,
    can_view_statistics: true,
    can_manage_inventory: true,
    can_view: true,
  };
}

function buildPayload(form: RoleForm): RoleForm {
  const payload: RoleForm = {
    ...form,
    code: normalizeRoleCode(form.code),
    name: form.name.trim(),
    description: form.description.trim(),
    can_manage_inventory: false,
    can_view: false,
  };

  if (payload.code === "admin") {
    return allRightsForm(payload);
  }

  return payload;
}

function normalizeRoleCode(code: string) {
  const normalized = code.trim().toLowerCase();
  return normalized === "string" ? "admin" : normalized;
}

function getRolePermissionLabels(role: Role) {
  return permissionItems.filter((item) => role[item.key]).map((item) => item.label);
}

export default function RolesPage() {
  const canManage = canManageRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdminForm = normalizeRoleCode(form.code) === "admin";
  const displayedForm = useMemo(() => (isAdminForm ? allRightsForm(form) : form), [form, isAdminForm]);

  const loadRoles = useCallback(async () => {
    if (!canManage) return;

    try {
      setLoading(true);
      setError(null);
      const page = await getRolePage(PAGE_SIZE, pageNumber, search);
      const pageCount = getPageCount(page);
      if (pageNumber > pageCount) {
        setTotalPages(pageCount);
        setPageNumber(pageCount);
        return;
      }
      setRoles(page.items);
      setTotalPages(pageCount);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }, [canManage, pageNumber, search]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function resetForm() {
    setEditRole(null);
    setForm(emptyForm);
  }

  function onEditClick(role: Role) {
    setEditRole(role);
    setForm(formFromRole(role));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setPermission(key: PermissionKey, value: boolean) {
    if (isAdminForm) return;
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = buildPayload(form);

      if (editRole) {
        await updateRole(editRole.id, payload);
        setSuccess("Rol täzelendi");
      } else {
        await createRole(payload);
        setSuccess("Rol döredildi");
      }

      resetForm();
      setPageNumber(1);
      await loadRoles();
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(role: Role) {
    if (!canManage || role.is_system) return;
    if (!confirm("Roly pozmak isleýärsiňizmi?")) return;

    try {
      setError(null);
      setSuccess(null);
      await deleteRole(role.id);
      setSuccess("Rol pozuldy");
      await loadRoles();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  if (!canManage) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
        <p style={{ color: "var(--text-muted)" }}>Rol dolandyryşy üçin degişli rugsat gerek.</p>
      </div>
    );
  }

  return (
    <div className="page-animate">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16 }}>
        <h2>Rollar</h2>
        <div style={{ width: 320 }}>
          <input
            placeholder="Rol gözleg..."
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{editRole ? `Roly üýtget #${editRole.id}` : "Rol döret"}</h3>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Kod</label>
              <input
                required
                value={form.code}
                disabled={Boolean(editRole?.is_system)}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="mysal: auditor"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Ady</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="text-sm text-muted">Düşündiriş</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {permissionGroups.map((group) => (
              <fieldset key={group.title} style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px", color: "var(--text-muted)", fontSize: 13 }}>{group.title}</legend>
                <div style={{ display: "grid", gap: 10 }}>
                  {group.items.map((item) => (
                    <label key={item.key} className="permission-toggle">
                      <input
                        type="checkbox"
                        checked={displayedForm[item.key]}
                        disabled={isAdminForm}
                        onChange={(e) => setPermission(item.key, e.target.checked)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saklanýar..." : editRole ? "Ýatda sakla" : "Döret"}
            </button>
            {editRole && (
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
                <th>Kod</th>
                <th>Ady</th>
                <th>Hukuklar</th>
                <th>Görnüşi</th>
                <th>Hereketler</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const labels = getRolePermissionLabels(role);
                return (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td style={{ fontWeight: 600 }}>{role.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{role.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{role.description || "-"}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {labels.length > 0 ? labels.map((label) => <span key={label} className="badge">{label}</span>) : "-"}
                      </div>
                    </td>
                    <td>{role.is_system ? <span className="badge status-warning">Ulgam</span> : <span className="badge">Adaty</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => onEditClick(role)} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }}>
                          Üýtget
                        </button>
                        <button
                          onClick={() => onDelete(role)}
                          disabled={role.is_system}
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: 12, opacity: role.is_system ? 0.5 : 1 }}
                        >
                          Poz
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {roles.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Rol tapylmady
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
    </div>
  );
}
