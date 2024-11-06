import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      login: () => {
        const userLocalStorage = sessionStorage.getItem("jwt");
        if (userLocalStorage) {
          set({ isAuthenticated: true });
        }
      },
      logout: () => {
        set({ isAuthenticated: false });
        sessionStorage.clear();
      },
    }),
    {
      name: "userLoginStatus",
    },
  ),
);
