import { useEffect, useMemo, useState } from "react";
import { changeUserPassword, getCurrentUser, type User } from "../api/users";
import { handleApiError } from "../api/client";
import { normalizePermissions, type PermissionKey, type RolePermissions } from "../utils/auth";

const permissionLabels: Record<PermissionKey, string> = {
  can_manage_users: "Ulanyjylary dolandyrmak",
  can_manage_roles: "Rollary dolandyrmak",
  can_view_inventory: "Inventary görmek",
  can_create_inventory: "Inventar döretmek",
  can_update_inventory: "Inventary üýtgetmek",
  can_delete_inventory: "Inventary pozmak",
  can_assign_devices: "Enjamlary bermek",
  can_return_devices: "Enjamlary gaýtarmak",
  can_import_devices: "Enjam importy",
  can_export_devices: "Enjam eksporty",
  can_clone_devices: "Enjam klonlamak",
  can_sync_employees: "Işgärleri sinhronlamak",
  can_view_statistics: "Statistikany görmek",
  can_manage_inventory: "Inventary doly dolandyrmak",
  can_view: "Diňe görmek",
};

const permissionOrder = Object.keys(permissionLabels) as PermissionKey[];

export default function MyProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (!cancelled) {
          setProfile(user);
        }
      } catch (e) {
        if (!cancelled) {
          setError(handleApiError(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const permissions = useMemo<RolePermissions>(() => normalizePermissions(profile?.permissions), [profile?.permissions]);
  const enabledPermissions = permissionOrder.filter((key) => permissions[key]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await changeUserPassword({
        user_id: profile.id,
        old_password: passwordForm.old_password,
        password: passwordForm.password,
        confirm_password: passwordForm.confirm_password,
      });
      setPasswordForm({ old_password: "", password: "", confirm_password: "" });
      setSuccess("Açar sözi üýtgedildi");
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card">Ýüklenýär...</div>;
  }

  if (!profile) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Profil ýükläp bolmady</h2>
        <p style={{ color: "var(--text-muted)" }}>{error || "Maglumat tapylmady"}</p>
      </div>
    );
  }

  return (
    <div className="page-animate">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)", gap: 24, alignItems: "start" }}>
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Meniň profilim</h2>

          {error && <div style={{ marginBottom: 16, color: "var(--danger)" }}>{error}</div>}
          {success && <div style={{ marginBottom: 16, color: "var(--success)" }}>{success}</div>}

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <InfoField label="Ady" value={profile.name || "-"} />
              <InfoField label="Familiýasy" value={profile.surname || "-"} />
              <InfoField label="Atasynyň ady" value={profile.patronymic || "-"} />
              <InfoField label="Username" value={profile.username} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <InfoField label="Rol kody" value={profile.role} />
              <InfoField label="Rol ady" value={profile.role_name || profile.role} />
              <InfoField label="Status" value={profile.status ? "Işjeň" : "Öçük"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <InfoField label="Döredilen senesi" value={profile.created_at} />
              <InfoField label="Soňky täzelenme" value={profile.updated_at} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Açar sözüni üýtget</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Köne açar söz</label>
              <input
                type="password"
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm((current) => ({ ...current, old_password: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Täze açar söz</label>
              <input
                type="password"
                required
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((current) => ({ ...current, password: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Täze açar sözi gaýtala</label>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm((current) => ({ ...current, confirm_password: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Ýatda saklanýar..." : "Açar sözi üýtget"}
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Rugsatlar</h3>
          <span className="badge" style={{ background: "var(--bg-hover)", color: "var(--text-main)" }}>
            {enabledPermissions.length} işjeň rugsat
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {permissionOrder.map((key) => (
            <div
              key={key}
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                background: permissions[key] ? "rgba(34, 197, 94, 0.08)" : "var(--bg-card)",
                color: permissions[key] ? "var(--text-main)" : "var(--text-muted)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{permissionLabels[key]}</div>
              <div style={{ fontSize: 13 }}>{permissions[key] ? "Bar" : "Ýok"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="text-sm text-muted">{label}</span>
      <div
        style={{
          minHeight: 42,
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--border-color)",
          background: "var(--bg-hover)",
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
