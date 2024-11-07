import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, removeCookie } from "@/utils/cookies";

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            isAuthenticated: false,
            token: null,
            login: (token: string) => {
                setCookie("jwt", token);
                set({ isAuthenticated: true, token });
            },
            logout: () => {
                removeCookie("jwt");
                set({ isAuthenticated: false, token: null });
            },
        }),
        {
            name: "userLoginStatus",
        }
    )
);
