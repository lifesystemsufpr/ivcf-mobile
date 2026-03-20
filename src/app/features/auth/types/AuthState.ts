import { AuthUser } from "./AuthUser";

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: AuthUser) => void;
    logout: () => void;
}