import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signIn, type SignInInput } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../api/client";

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (data: SignInInput) => signIn(data),
        onSuccess: (data) => {
            // Assuming result is { "token": "..." } or similar map.
            // Based on auth.go: c.JSON(http.StatusOK, result) where result is from GenerateToken.
            // Usually GenerateToken returns string token or struct.
            // If it returns map[string]string as documented in swagger: { "token": "..." }

            // Let's assume the token is in data.token based on our interface, 
            // OR if the backend returns JUST the token string (unlikely for map[string]string), adjustment needed.
            // If backend returns map like {"token": "xyz"}, then data.token is correct.

            // Use "token" key or "accessToken"? Typical is "token".
            // Let's inspect response if it fails, but for now assuming "token".
            if (data && data.token) {
                localStorage.setItem("auth_token", data.token);
                navigate("/dashboard", { replace: true });
            } else {
                // Fallback if key is different (e.g. just the string?)
                // For map[string]string it must have a key.
                console.error("Token not found in response", data);
                setError("Token not found in server response");
            }
        },
        onError: (err) => {
            setError(handleApiError(err));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;
        mutation.mutate({ username, password });
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-body)",
            padding: 16
        }}>
            <div className="card" style={{
                width: "100%",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                backdropFilter: "blur(12px)",
                background: "var(--bg-card)"
            }}>
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "8px" }}>Inwentar Ulgamy</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Hasabyňyza giriň</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-main)" }}>Ulanyjy ady</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-main)" }}>Açar sözi</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: "10px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "var(--danger)",
                            fontSize: "14px"
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: "8px", justifyContent: "center" }}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Girilýär..." : "Girmek"}
                    </button>
                </form>
            </div>
        </div>
    );
}
