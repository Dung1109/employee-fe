// auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { setCookie, removeCookie } from "@/utils/cookies"; // Import the cookie functions

interface AuthState {
    token: string | null;
    username: string | null;
    email: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

interface JWTPayload {
    sub: string; // username
    email: string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            username: null,
            email: null,
            isAuthenticated: false,
            login: (token: string) => {
                const decoded = jwtDecode<JWTPayload>(token);
                set({
                    token,
                    username: decoded.sub,
                    email: decoded.email,
                    isAuthenticated: true,
                });
                setCookie("jwt", token); // Set the cookie when logging in
            },
            logout: () => {
                set({
                    token: null,
                    username: null,
                    email: null,
                    isAuthenticated: false,
                });
                removeCookie("jwt"); // Remove the cookie when logging out
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
