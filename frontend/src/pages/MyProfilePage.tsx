import { useEffect, useState } from "react";
import { changeUserPassword, getCurrentUser, type User } from "../api/users";
import { handleApiError } from "../api/client";
import PasswordInput from "../components/PasswordInput";

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
              <PasswordInput
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm((current) => ({ ...current, old_password: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Täze açar söz</label>
              <PasswordInput
                required
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((current) => ({ ...current, password: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="text-sm text-muted">Täze açar sözi gaýtala</label>
              <PasswordInput
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
