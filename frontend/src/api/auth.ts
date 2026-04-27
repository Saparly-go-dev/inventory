import { api } from "./client";

export interface SignInInput {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    role: string;
}

export async function signIn(input: SignInInput) {
    // Backend returns map[string]string. Usually {"token": "..."}
    const res = await api.post<AuthResponse>("/api/auth/signIn", input);
    return res.data;
}
