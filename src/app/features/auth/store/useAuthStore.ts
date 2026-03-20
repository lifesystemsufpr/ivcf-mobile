import { create } from "zustand";
import { AuthState } from "../types/AuthState";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create<AuthState>()(
    persist(

        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            setAuth: (token, user) => {
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },

        }),

        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)